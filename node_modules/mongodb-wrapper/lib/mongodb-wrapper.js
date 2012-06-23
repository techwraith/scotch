var __extends = function(child, parent) {
  var ctor = function(){};
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.prototype.constructor = child;
  if (typeof parent.extended === "function") parent.extended(child);
  child.__super__ = parent.prototype;
};

// Actual connections to the server are independent of these objects
// These objects just USE the connections under the hood
// The module is responsible for managing connections to different databases, too
// Or, rather, the database object
var util = require('util')
var SortAscendingNum = 1
var SortDescendingNum = -1
var SortAscendingKey = 'ascending'
var SortDescendingKey = 'descending'
var mongodb = require('mongodb')
var events = require('events')
// the query param must return a cursor

exports.log = util.log
function noop() {}

// Cursor is chained: find().limit(1).sort({dt:1}).toArray()
var Cursor = exports.Cursor = function(query) {
    var self = this
    var limit = null
    var skip = 0
    var sort = null
    var nextIndex = 0
	// var hint = null
    
    // Limit the results returned find().limit(2)
    self.limit = function(num) {
        limit = num
        return self
    }
    
    // Skip some results. Used with Limit. find().limit(2).skip(1)
    self.skip = function(num) {
        skip = num
        return self
    }

    // Sort. Used with limit and skip: find().sort({somefield:1}).limit(10).skip(100)
    self.sort = function(naturalMongoSyntax) {
		sort = sortSyntax(naturalMongoSyntax)
        return self
    }
    
    // returns the first one: find().one(cb)
    self.one = function(callback) {
        return self.next(callback)
    }
    
    // You can call this multiple times and get the next doc each time
    // cursor = db.something.find().next (err, doc) ->
    //         cursor.next (err, doc) ->
    //         ....
    self.next = function(callback) {
        var localIndex
        // Either way we want this, right
        localIndex = skip + nextIndex++
        // gets a cursor with those applied

        return cursor(function(err, cursor) {
            if (err) return callback(err) 
            // manually set the limit and skip
            // they might have set it themselves!

            cursor.limit(1, function() {})

            cursor.skip(localIndex, function() {})
            // I already called limit 1, so toArray will be friendly

            cursor.toArray(function(err, docs) {
                if (limit && (localIndex >= (skip + limit))) docs = [] 
                docs = docs || []
                cursor.done()
                callback(err, docs[0])
            })
        })
    }
    
    
    
    // # this doesn't work
    // # count counts the entire collection, and doesn't take the limit and skip into consideration
    // # needs to work on an unlimited collection too!
    // self.hasNext = (callback) -> 
    //         
    //         self.count (err, count) ->
    //                 if err then return callback err
    //                 
    //                 withinLimit = ((not limit) or nextIndex < limit)
    //                 withinCount = ((nextIndex + skip) < count)
    //                 callback null, (withinLimit and withinCount)




    // Calls the callback for each matched result
    // db.something.find().each (err, doc) ->
    // I don't know how to make this work with auto-close. Wait
    // until you can get it working. 
    
    // self.each = function(callback) {    
    //     return cursor(function(err, cursor) {
    //         if (err) return callback(err) 
    //         return cursor.each(callback)
    //     })
    // }
    
        
    // Explains whether you hit an index and how many were scanned
    // db.something.find({field: "somevalue"}).explain (err, explanation) ->

    self.explain = function(callback) {

        return cursor(function(err, cursor) {
            if (err) return callback(err) 
            return cursor.explain(function(err, explanation) {
                cursor.done()                
                callback(err, explanation)
            })
        })
    }
    // Returns the results as an array. Consider using each or skip & limit for large collections.
    // db.something.find().toArray (err, docs) ->

    self.toArray = function(callback) {

        return cursor(function(err, cursor) {
            if (err) return callback(err) 
            return cursor.toArray(function(err, docs) {
                cursor.done()
                callback(err, docs)
            })
        })
    }

    self.count = function(callback) {

        return cursor(function(err, cursor) {
            if (err) return callback(err) 
            return cursor.count(function(err, count) {
                cursor.done()                
                callback(err, count)
            })
        })
    }
    // private. modifies the cursor with limit, skip and sort

    function cursor(callback) {

        query(function(err, cursor) {
            if (err) return callback(err) 
            // They're actually synchronous. I'm taking advantage of that implementation detail
            if (limit) cursor.limit(limit, function() {}) 
            if (skip) cursor.skip(skip, function() {}) 
            if (sort) cursor.sort(sort, function() {}) 
			// if (hint) cursor.hint = hint
            return callback(null, cursor)
        })
        return self
    }
    return self
}

Cursor.BasicCursor = "BasicCursor"

var Collection = exports.Collection = function(database, name) {
    var connection, self
    self = this

    self.name = function() {
        return name
    }

    self.database = function() {
        return database
    }
    // private, load the collection object
    // I'm pretty sure the collection loading is synchronous

    function connection(cb) {
        
        database.connection(function(err, db) {
            if (err) return cb(err) 

            db.collection(name, function(err, collection) {

                if (collection) {

                    collection.done = function() {
                        return db.done()
                    }
                }
                cb(err, collection)
            })
        })
    }
    // Ensures an index

    // db.mycollection.ensureIndex {field: 1}, {unique: true}, (err, indexName) ->

    // db.mycollection.ensureIndex {field: 1}, (err, indexName) ->

    self.ensureIndex = function(index, options, cb) {
        var indexArray;

        if ((typeof options) === 'function') {
            cb = options
            options = {unique: false}
        }

        cb = cb || noop
        indexArray = []
        
        for (var fieldName in index) {
            var direction = index[fieldName]
            indexArray.push([fieldName, direction])
        }

        connection(function(err, connection) {
            if (err) return cb(err) 

            connection.ensureIndex(indexArray, options, function(err, indexName) {
                connection.done()
                cb(err, indexName)
            })
        })
    }

    self.dropIndexes = function(cb) {
        cb = cb || noop

        connection(function(err, connection) {
            if (err) return cb(err) 

            connection.dropIndexes(function(err) {
                connection.done()
                return cb(err)
            })
        })
    }
    // self.dropIndex = (indexName, cb) ->
    //         cb = cb || noop
    //         connection (err, connection) ->
    //                 if err then return cb err
    //                 connection.dropIndex indexName, cb
    // renameCollection (targetName, cb)
    // renameCollection (targetName, dropTarget, cb)

    self.renameCollection = function(targetName, dropTarget, cb) {
        var performRename, targetCollection
        // the native library doesn't support drop collection
        // I'll have to do it by hand. Be careful, this isn't
        // atomic like it's supposed to be
        cb = cb || noop

        if ((typeof dropTarget) === 'function') {
            cb = dropTarget
            dropTarget = false
        }
        

        function performRename() {

            connection(function(err, connection) {
                if (err) return cb(err) 
                
                connection.rename(database.prefixName(targetName), function(err, collection) {
                    connection.done()
                    cb(err)
                })
            })
        }

        if (dropTarget) {
            targetCollection = database.collection(targetName)

            targetCollection.drop(function(err) {
                if (err) return cb(err) 
                performRename()
            })
        }
        
        else
            performRename()
    }
    
    self.insert = function(docs, cb) {
        cb = cb || noop

        connection(function(err, connection) {
            if (err) return cb(err) 

            connection.insert(docs, function(err, doc) {
                connection.done()
                cb(err, doc)
            })
        })
    }

    self.remove = function(selector, cb) {
        cb = cb || noop

        connection(function(err, connection) {
            if (err) return cb(err) 

            connection.remove(selector, function(err) {
                connection.done()
                cb(err)
            })
        })
    }

    self.drop = function(cb) {
        cb = cb || noop

        connection(function(err, connection) {
            if (err) return cb(err) 

            connection.drop(function(err) {
                connection.done()
                
                if (err && err.message === 'ns not found')
                    cb(null, false)
                else 
                    cb(err, true)
            })
        })
    }
    
    // save does an upsert if you specify an _id, otherwise it does an insert
    self.save = function(doc, cb) {
        cb = cb || noop

        connection(function(err, connection) {
            if (err) return cb(err) 

            connection.save(doc, function(err, doc) {
                connection.done()
                cb(err, doc)
            })
        })
    }
    // updates the object # Missing multi!

    self.update = function(selector, updates, upsert, multi, cb) {
        var options

        if ((typeof upsert) === 'function') {
            cb = upsert
            upsert = false

        } else if ((typeof multi) === 'function') {
            cb = multi
            multi = false
        }

        options = {
            upsert: upsert,
            multi: multi
        }
        cb = cb || noop

        connection(function(err, connection) {
            if (err) return cb(err) 

            connection.update(selector, updates, options, function(err, doc) {
                connection.done()
                cb(err, doc)
            })
        })
    }
    
    
    
    // return the count
    // db.something.count()
    self.count = function(cb) {
        cb = cb || noop

        return connection(function(err, connection) {
            if (err) return cb(err) 

            return connection.count(function(err, count) {
                connection.done()
                return cb(err, count)
            })
        })
    }
    
    self.findAndModify = function(options, cb) {

        cb = cb || noop

        connection(function(err, connection) {

            if (err) return cb(err) 

	    	var query = options.query || {}
	    	var sort = options.sort ? sortSyntax(options.sort) : []
	    	var update = options.update || {}
	    	var fields = options.fields || {}
	    	delete options.query
	    	delete options.sort
	    	delete options.update    	

	    	connection.findAndModify (query, sort, update, options, function(err, result) {					
                connection.done()
                return cb(err, result)
	    	})

		})
    }
    
    // Your basic find. See Mongo Docs for all your options. 

    // db.something.find({somefield: "somevalue", anotherfield: 'another'},{somefield:1}).one (err, doc) ->

    self.find = function(selector, fields) {
        
        selector = selector || {}
        fields = fields || {}

        return new Cursor(function(callback) {
            
            connection(function(err, connection) {
                if (err) return callback(err) 

                connection.find(selector, fields, function(err, cursor) {
                    
                    cursor.done = function() {
                        connection.done()
                    }
                    
                    callback(err, cursor)
                })
            })
        })
    }
    
    // Sugar for find.one
    self.findOne = function(selector, fields, callback) {

        if ((typeof selector) === 'function') {
            callback = selector

            selector = {}
            fields = null

        } else if ((typeof fields) === 'function') {
            callback = fields
            fields = null
        }
        return self.find(selector, fields).one(callback)
    }
    
    
    // group is awesome
	self.group = function(options, cb) {
        cb = cb || noop

        connection(function(err, connection) {

            if (err) return cb(err) 

			var reduce = options.reduce || options['$reduce'] || noop
			var cond = options.cond || {}
			var key = options.key || {}
			var initial = options.initial || {} 

			connection.group(key, cond, initial, reduce, function(err, doc) {
                connection.done()
                return cb(err, doc)
            })
        })
	}

    // options = {out:"outcollection"}
    // Note that emit ALWAYS creates something like this: {_id:"asdf", value:"whatever you emitted"}
    self.mapReduce = function(map, reduce, options, cb) {
        cb = cb || noop
        connection(function(err, connection) {
            if (err) return cb(err)
            connection.mapReduce(map, reduce, options, function(err) {
                connection.done()
                cb(err)
            })
        })
    }

    self.toString = function() {
        return "Collection " + name
    }
    
    //follows the pattern ('fieldName', {"otherFieldName":"foo"})
    self.distinct = function(key, query, cb){
        if(typeof query === 'function') {
            cb = query
            query = null
        }
        connection(function(err, connection){
            connection.distinct(key, query, function(err, results) {
				connection.done()
				cb(err, results)
			})
        })
    }
    
    return self
}

var DatabaseConnectionIsOpening = 'opening'
var DatabaseConnectionOpen = 'open'
var DatabaseConnectionClosed = 'closed'
var DatabaseConnectionClosing = 'closing'
// exports.MaximumConnectionsBeforeRecycling = 40000
exports.AutoCloseTimeout = 100
// Connection Pooling wasn't any faster for importing schedules!

var Database = exports.Database = function(host, port, name, prefix, username, password) {
    var alreadyDefinedCollections, autoCloser, connection, connectionOpened, emitter, open, reset, self, state

    self = this
    emitter = null
    // so we can accept a bunch of requests at once
    connection = null
    // the cached mongo database connection
    state = null
    // Opening, Open or Closed
    autoCloser = null

    alreadyDefinedCollections = {}

    self.shouldAutoClose = true

    self.name = function() {
        return name
    }

    self.host = function() {
        return host
    }

    self.port = function() {
        return port
    }

    self.prefix = function() {
        return prefix
    }


    self.toString = function() {
        return host + " " + port + " " + name + ":" + state
    }
    
    self.outstandingCommands = function() {
        if (!connection) return 0
        return connection.outstandingCommands()
    }    
    
    self.currentConnection = function() {
        return connection
    }

    // allows you to turn off auto-close
    self.keepOpen = function() {
        self.shouldAutoClose = false
        connection.shouldAutoClose = false
    }
    
    self.close = function() {
        self.shouldAutoClose = true
        connection.shouldAutoClose = true
    }
    
    
    // whenever we close, we'll recreate this
    function reset() {
        emitter = new events.EventEmitter()
        emitter.setMaxListeners(100000) // we should allow for many listeners for open if we want
        state = DatabaseConnectionClosed
        connection = new Connection(host, port, name)
        connection.shouldAutoClose = self.shouldAutoClose

        connection.on('error', function(err) {
            if (state == DatabaseConnectionIsOpening) {
				        connectionOpened.shouldAutoClose = true	
                connectionOpened(err)
			      }
        })
    }
    reset()
    
    // self.onRecycle = (callback) -> emitter.on 'recycle', callback
    // ignore / deprecated

    // protected. Gets a connection (already open or a new one) 
    self.connection = function(callback) {
        
        // or connection.reused > exports.MaximumConnectionsBeforeRecycling
        if (connection.invalid) reset() 
        // Track how many times we're using it
        connection.use()

        if (state === DatabaseConnectionOpen) {
            connection.reused += 1
            return callback(null, connection)
        }
        emitter.on('opened', callback)
        open()
    }

    // private. call connection instead. Actually opens the thing
    function open() {
        if (state === DatabaseConnectionIsOpening) return null 
        state = DatabaseConnectionIsOpening
        connection.open(connectionOpened)

    }

    function connectionOpened(err, connection) {

        // if they want to authenticate. If we've had an error, just pass it through
        if (!err && username && password) {
            connection.authenticate(username, password, function(err) {
                // if there is an error, then this connection is used up
                if (err) connection.done()
                notifyListeners(err)
            }) 
        }

        else
            notifyListeners(err)
    }

    function notifyListeners(err) {

        // connectionOpened can get called twice by the underlying wrapper
        // remove all listeners after firing to prevent doubles. 
        // keep track of the emitter you started with because something in .emit('opened') could change it

        state = err ? DatabaseConnectionClosed : DatabaseConnectionOpen
        var currentEmitter = emitter
        currentEmitter.emit('opened', err, connection)
        currentEmitter.removeAllListeners('opened')        
    }

    // recycle =-> 
    //         #emitter.emit 'recycle', connection
    //         reset()
    // Returns a collection. Consider setting fields on the db to collections. This is cheap
    // Also sets self[name] to the collection for db.
    // db = mongo.db host, port, name
    // db.collection 'mycollection'
    // db.mycollection.find().one (err, doc) ->

    self.collection = function(fullname) {
        var i, localName, names, obj
        // "somecollection"
        // "some.collection"
        if (alreadyDefinedCollections[fullname]) return alreadyDefinedCollections[fullname] 
        names = fullname.split(/\./)
        obj = self
        // loop through all items except the last

        for (i = 0; (0 <= names.length - 1 ? i < names.length - 1 : i > names.length - 1); (0 <= names.length - 1 ? i += 1 : i -= 1)) {
            localName = names[i]
            // update name to be some

            obj[localName] = (typeof obj[localName] !== "undefined" && obj[localName] !== null) ? obj[localName] : {}
            // create self.some
            obj = obj[localName]
        }
        // obj is now self
        localName = names.pop()
        // make sure we get the last name
        obj[localName] = new Collection(self, self.prefixName(fullname))
        return (alreadyDefinedCollections[fullname] = obj[localName])
    }

    self.prefixName = function(name) {
        if (!prefix) return name 
        if (name.match(new RegExp("^" + prefix + "\\."))) return name 
        return (prefix + "." + name)
    }


    self.auth = function(username, password, cb) {
        self.connection(function(err, connection) {
            if (err) return cb(err)
            connection.authenticate(username, password, function(err) {
                connection.done()
                cb(err)
            })
        })
    }

    self.addUser = function(username, password, cb) {

        self.connection(function(err, connection) {
            if (err) return cb(err)
            connection.addUser(username, password, {}, function(err, user) {
                connection.done()
                cb(err, user)
            })
        })
    }

    self.removeUser = function(username, cb) {
        self.connection(function(err, connection) {
            if (err) return cb(err)
            connection.removeUser(username, function(err) {
                connection.done()
                cb(err)
            })
        })
    }
    
    // cb (err, lastError)
    // lastError = {err: null, n: 0, ok: 1}
    self.lastError = function(cb) {

        self.connection(function(err, connection) {
            if (err) return cb(err) 

            connection.lastError(function(err, lastError) {
                connection.done()
                cb(err, lastError)
            })
        })
    }
    
    // evals code on the server
    self.eval = function(code, parameters, cb) {
        
        if ((typeof parameters) === 'function') {
            cb = parameters
            parameters = {}
        }
        
        cb = cb || noop
        
        self.connection(function(err, connection) {
            if (err) return cb(err)
            connection.eval(code, parameters, function(err) {
                connection.done()
                cb(err)
            })
        })
    }

    self.dropDatabase = function(cb) {
        self.connection(function(err, connection) {
            if (err) return cb(err) 

            connection.dropDatabase(function(err) {
                connection.done()
                cb(err)
            })
        })
    }
    
    self.createCollection = function(colName, options, cb) {
        cb = cb || noop
        self.connection(function(err, connection) {
            if (err) return cb(err)
            
            connection.createCollection(colName, options, function(err) {
                connection.done()
                cb(err)
            })
        })
    }
    

    self.getCollectionNames = function(cb) {
        self.connection(function(err, connection) {
            if (err) return cb(err)
            
            connection.collectionNames(function(err, names) {
                connection.done()                
                if (err) return cb(err)
                    
                names = names.map(function(item) {
                    return item.name.replace(self.name() + ".", "")
                })            
                
            
                cb(null, names)
            })
        })
    }

    self.dropAllCollections = function(cb) {
        var waitingForDrop = 0
        
        for (var name in self) {
            var obj = self[name]
            if (obj instanceof Collection) {
                waitingForDrop++
        
                obj.drop(function(err) {
                    if (err) return cb(err) 
                    if (--waitingForDrop === 0) 
                        cb()
                })
            }            
        }
    }
    
    self.dropAllCollectionsOnServer = function(cb) {
        // same, but this will actually ask for all the names on the server
        // and drop them that way. The other one will just drop collections
        // actually specified on this object. 
        
        self.getCollectionNames(function(err, names) {
            if (err) return cb(err)
            
            if (names.length == 0) return cb()            
            
            var remaining = names.length
            
            names.forEach(function(name) {
                var collection = new Collection(self, name)
                
                if (name.match(/^system/)) return next()
                
                collection.drop(function(err) {
                    if (err) return cb(err)
                    next()
                })
            })    
            
            function next() {
                if (--remaining == 0) cb()
            }        
        })
    }

    return self
}

// A connection object! Stores some extra info on the mongoDatabase object
// It might be because I have all this stuff I'm referencing. Closure-style
// Try traditional inheritance

var Connection = exports.Connection = function(host, port, name) {

    var server = new mongodb.Server(host, port, {
        native_parser: true
    })

    Connection.__super__.constructor.call(this, name, server, {})
    this.reused = 0
    this.started = 0
    this.completed = 0
    this.autoCloser = null
    this.invalid = false
    this.host = host
    this.port = port
    this.name = name
    this.shouldAutoClose = true

    this.on('error', function(err) {
        exports.log(" !!! Mongo (" + err + ")")
        return this.destroy()
    })
    return this
}

__extends(Connection, mongodb.Db)
// onAutoClose: (cb) -> @on 'autoclose', cb

// Connection.prototype = new mongodb.Db()

Connection.prototype.outstandingCommands = function() {
    return this.started - this.completed
}

Connection.prototype.destroy = function() {
    this.invalid = true
    this.cleanAutoClose()
    var self = this

    // HACK! The underlying Db does NOT like to be closed early. 
    // I could poll something, but I don't know what. 
    setTimeout(function() {
        self.close()
    }, 10)

    this.db = null
}


Connection.prototype.use = function() {
    
    this.started += 1
    return this.cleanAutoClose()
}


Connection.prototype.cleanAutoClose = function() {
    clearTimeout(this.autoCloser)
    this.autoCloser = null
}


Connection.prototype.done = function() {
    var current, self
    this.completed += 1
    
    if (this.shouldAutoClose && this.started === this.completed) {
        current = this.started
        self = this

        process.nextTick(function() {
            var later

            if (self.started === current) {

                function later() {
                    self.autoCloser = null

                    if (self.started === current) {

                        // self.emit 'autoclose'
                        return self.destroy()
                    }
                }
                
                self.autoCloser = setTimeout(later, exports.AutoCloseTimeout)
            }
        })
    }
}


Connection.prototype.toString = function() {
    return "mongo.Connection: " + (this.host) + " " + (this.name) + " " + (this.completed) + "/" + (this.started)
}

// Returns an unopened db object
// The database is the machine (host/port)
// db = mongo.db host, port, name

exports.db = function(host, port, name, prefix, username, password) {
    return new Database(host, port, name, prefix, username, password)
}   
                         
// Expose ObjectID
exports.ObjectID = mongodb.BSONPure.ObjectID

function sortSyntax(naturalMongoSyntax) {

    var sort = []

    for (var field in naturalMongoSyntax) { 
        var orderNum = naturalMongoSyntax[field]
        var key = (orderNum === SortDescendingNum) ? SortDescendingKey : SortAscendingKey
        sort.push([field, key])            
    }
    
	return sort
}
