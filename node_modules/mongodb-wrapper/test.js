
var util = require('util')
var assert = require('assert')

// normally you make one per test, but here
// we'll reuse it for each
var mongo = require('./lib/mongodb-wrapper')     

exports.authentication = function(assert) {
    var db = mongo.db('localhost', 27017, 'test', null, 'baduser', 'badpass')
    db.collection('mongo.auth')

    // fail bad login 
    db.mongo.auth.save({one:"two"}, function(err, doc) {
        assert.ok(err, "Authentication should fail")

        var db = mongo.db('localhost', 27017, 'test')

        db.addUser('user', 'pass', function(err) {
            assert.ifError(err)

            db.auth('user', 'pass', function(err) {
                assert.ifError(err)

                var db = mongo.db('localhost', 27017, 'test', null, 'user', 'pass')
                db.collection('mongo.auth')
                db.mongo.auth.save({one:"two"}, function(err, doc) {
                    assert.ifError(err)

                    db.removeUser('user', function(err) {
                        assert.ifError(err)
                        assert.finish()
                    })
                })
            })
        })
    })
}

exports.basics = function(assert) {
    var db     = mongo.db("localhost", 27017, "test")
    db.collection('mongo.basics')
    db.toString()

    // basic coverage for syntax errors
    db.mongo.basics.toString()

	assert.ok(db.mongo.basics.database())
	assert.equal(db.host(), "localhost")
	assert.equal(db.port(), 27017)
	
	var prefixedDb = mongo.db("localhost", 27017, "test", "prefix")
	assert.equal(prefixedDb.prefix(), "prefix")

    // same
    db.mongo.basics.drop(function(err) {
        if (err) throw new Error(err) 

        db.mongo.basics.save({ _id: "one", property: "value" }, function(err, doc) {
            if (err) throw err 

            db.mongo.basics.findOne(function(err, doc) {
                if (err) throw err 
                assert.equal(doc._id, "one")
            assert.equal(doc.property, "value")
                assert.finish()
            })
        })
    })
}

exports.eval = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.testEval')
    
    function go() {
        db.mongo.testEval.save({_id:'woot'})
    }
    
    db.eval(go, {}, function(err) {
        assert.ifError(err)
		
		db.eval(go, function(err) {
	        db.mongo.testEval.findOne({}, function(err, doc) {
	            assert.ifError(err)
	            assert.ok(doc, "Didn't find anything")
	            assert.equal(doc._id, "woot")
	            assert.finish()
	        })			
		})
    })
}

exports.distinct = function(assert) {
	var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.distinct')

	db.mongo.distinct.insert({_id:"A", name:"henry"})
	db.mongo.distinct.insert({_id:"B", name:"henry"})	
	db.mongo.distinct.insert({_id:"C", name:"joe"})		
	
	db.mongo.distinct.distinct("name", {}, function(err, names) {
		assert.ifError(err)
		assert.ok(names)
		assert.equal(names.length, 2)
		assert.finish()
	})
    
}


exports.reset = function(assert) {
	var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.reset')
	mongo.log = function() {}

	db.mongo.reset.find().toArray(function(err, array) {
		// assert.ok(err)
        assert.finish()
	})

	var connection = db.currentConnection()
    connection.emit('error', new Error("Nothing"))
}


exports.makeSureTheAboveTestDoesntThrowAnError = function(assert) {
    // if this errors, then the code above is throwing an error AFTER assert.finish is called
    setTimeout(function() {
        assert.finish()
    }, 100)
}

exports.disableAutoClose = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.disableAutoClose')
    
    // get it open
    
    assert.ok(!db.currentConnection().invalid, "Connection shouldn't be invalid yet")
    
    db.mongo.disableAutoClose.save({_id:"henry"}, function(err) {
        assert.ifError(err)
        assert.ok(!db.currentConnection().invalid, "Connection shouldn't be invalid yet")
        
        function wait() {
            assert.ok(db.currentConnection().invalid, "Connection should be invalid")
            
            db.keepOpen()
            db.mongo.disableAutoClose.save({_id:"woot"}, function(err) {
                assert.ifError(err)
                
                function waitSomeMore() {
                    assert.equal(db.currentConnection().invalid, false, "Connection auto closed when disabled")
                    db.close()
                                                            
                    db.mongo.disableAutoClose.findOne({_id:"henry"}, function(err,doc) {
                        assert.ifError(err)
                        assert.ok(doc, "No doc found after")
                        assert.finish()
                        db.close()
                    })
                }
                
                setTimeout(waitSomeMore, mongo.AutoCloseTimeout+10)
            })
            
        }
        setTimeout(wait, mongo.AutoCloseTimeout+10)
    })
}


exports.group = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.testGR')
    db.collection('mongo.outGR')
    db.mongo.testGR.remove({})
    db.mongo.testGR.insert([{_id:"one",friends:[{name:"bad",count:2}]}, {_id:"two",friends:[{name:"bad", count:3},{name:"salsa", count:4}]}], function(err) {
        db.mongo.testGR.group({
			key: {},
			cond: {friends:{$exists:true}},
        	initial: {},
        	reduce: function(obj, out) {
				obj.friends.forEach(function(friend) {
					if (!out[friend.name]) out[friend.name] = 0
					out[friend.name] += friend.count
				})
        	}
        }, function(err, result) {
            assert.ifError(err)
			assert.equal(result[0].bad, 5)
			assert.equal(result[0].salsa, 4)
            assert.finish()
        })        

    })
}

exports.findAndModify = function(assert) {
    var db = mongo.db("localhost", 27017, "test");
    db.collection('mongo.testFM');
	db.mongo.testFM.drop();
    db.mongo.testFM.insert({_id:"one", count:1, junk:"trash"}, function(err) {
		assert.ifError(err)
        db.mongo.testFM.findAndModify({
        	query:{_id:"one"},
        	fields:{junk:0},
        	update:{$inc:{count:1}},
        	new: true        	
        }, function(err, result) {
			assert.ifError(err)
        	assert.equal(result.count, 2)
        	assert.ok(!result.junk)
        	assert.finish()
        }) 
    
    })
    
}

exports.mapReduce = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.testMR')
    db.collection('mongo.outMR')
    
    db.mongo.testMR.insert([{_id:"one"}, {_id:"two"}], function(err) {
        db.mongo.testMR.mapReduce(function() {
            emit("henry " + this._id, "goof")
        }, function (key, values) {
            return values[0]
        }, {
            out: "mongo.outMR"
        }, function(err) {
            assert.ifError(err)
            db.mongo.outMR.find().toArray(function(err, docs) {
                assert.ifError(err)
                assert.equal(docs.length, 2, "Didn't find docs in map reduce")
                assert.equal(docs[0].value, "goof")
                assert.ok(docs[0]._id.match(/henry/))
                assert.finish()
            })
        })        
    })
}



exports.renameCollection = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.startname')
    db.collection('mongo.endname')
    db.collection('mongo.toreplace')

    db.mongo.startname.drop(function(err) {
        assert.ifError(err)
    })

    db.mongo.endname.drop(function(err) {
        assert.ifError(err)
    })

    db.mongo.toreplace.drop(function(err) {
        assert.ifError(err)
    })

    db.mongo.startname.ensureIndex({ value: 1 }, function(err) {
        assert.ifError(err)

        db.mongo.startname.save({ _id: "woot", value: "value" }, function(err, doc) {
            assert.ifError(err)

            db.mongo.startname.count(function(err, num) {
                assert.ifError(err)
                assert.equal(num, 1, "Wrong number saved in renameCollection")

                db.mongo.startname.renameCollection('mongo.endname', function(err) {
                    assert.ifError(err)

                    db.mongo.startname.count(function(err, num) {
                        assert.ifError(err)
                        assert.equal(num, 0, "startname shouldn't have items any more")

                        db.mongo.endname.count(function(err, num) {
                            assert.ifError(err)
                            assert.equal(num, 1, "endname should have starts items")

                            db.mongo.toreplace.save({ _id: "boot", value: "value" }, function(err, doc) {
                                assert.ifError(err)

                                db.mongo.endname.renameCollection('mongo.toreplace', true, function(err) {
                                    assert.ifError(err)

                                    var cursor = db.mongo.toreplace.find({ value: "value" }).one(function(err, doc) {
                                        assert.ifError(err)
                                        assert.notEqual(doc._id, "boot", "Didn't replace collection " + doc)
                                        assert.equal(doc._id, "woot", "Wrong id for doc " + (util.inspect(doc)))

                                        cursor.explain(function(err, explanation) {
                                            assert.ifError(err)
                                            assert.notEqual(explanation.cursor, mongo.Cursor.BasicCursor, "Didn't carry over indices")
                                            assert.finish()
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}


exports.collectionnames = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.collection.names.one')
    db.collection('mongo.collection.names.two')
    assert.ok(db.mongo.collection.names.one, "One doesn't exist")
    assert.ok(db.mongo.collection.names.two, "One doesn't exist")
    assert.finish()
}


exports.redefineCollection = function(assert) {
    var collection, db, secondCollection
    db = mongo.db("localhost", 27017, "test")
    collection = db.collection('mongo.redefineCollection')
    secondCollection = db.collection(collection.name())
    assert.equal(collection, secondCollection, "Should have reused collection when redefining")
    assert.finish()
}


exports.failedInsert = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    var collection = db.collection('mongo.failedinsert')

    // Expected behavior is that the second batch-insert fails. That's really too
    // bad. It would have been nice if there weren't any discrepancies. 
    // Well, I can insert one, I guess

    collection.insert([{ _id: "A" }, { _id: "B" }], function(err, docs) {
        assert.ifError(err)

        collection.insert([{ _id: "B" }, { _id: "C" }], function(err, docs) {
            assert.ifError(err)

            collection.find().toArray(function(err, docs) {
                assert.ifError(err)
                assert.equal(docs.length, 2, "Doc C got through. I expected it to fail!")
                assert.finish()
            })
        })
    })
}


exports.finding = function(assert) {
    var collection, db
    db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.finding')
    collection = db.mongo.finding
    
    function assertError(err) { assert.ifError(err) }

    collection.drop(function(err) {
        var cursor, eachIndex, ids
        if (err) throw err 

        collection.save({ _id: "A", color: "red", size: 8 }, assertError)
        collection.save({ _id: "B", color: "red", size: 6 }, assertError)
        collection.save({ _id: "C", color: "blue", size: 5 }, assertError)
        collection.save({ _id: "D", color: "blue", size: 4 }, assertError)

        collection.find({}, { color: 1 }).limit(2).skip(1).sort({ _id: 1 }).toArray(function(err, docs) {
            if (err) throw err 
            assert.equal(docs[0]._id, "B", "found the wrong document. Should have been B " + (util.inspect(docs)))
            assert.equal(docs[0].size, null, "did not limit the fields returned " + (util.inspect(docs)))
            assert.equal(docs[1]._id, "C")
        })

        collection.findOne({ _id: "B" }, function(err, doc) {
            if (err) throw err 
            assert.equal(doc._id, "B")
        })
        // Test Each
        ids = ['A', 'B', 'C', 'D']
        eachIndex = 0

        // each is deprecated for now. Not in use
        // collection.find().each(function(err, doc) {
        //     if (err) throw err 
        //     if (doc) assert.equal(ids[eachIndex], doc._id) 
        //     eachIndex++
        // })

        collection.count(function(err, num) {
            if (err) throw err 
            assert.equal(num, 4)
        })
        
        cursor = collection.find()

        cursor.next(function(err, doc) {
            if (err) throw err 
            assert.equal(doc._id, "A")

            cursor.next(function(err, doc) {
                assert.equal(doc._id, "B")
                assert.finish()
            })
        })
    })
}


exports.maintenance = function(assert) {
    var db, maintenance
    db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.maintenance')
    maintenance = db.mongo.maintenance

    maintenance.drop(function(err) {
        if (err) throw err 
        // Test double-drop

        maintenance.drop(function(err) {
            if (err) throw err 

            maintenance.save({ _id: "A", property: "value" })
            maintenance.save({ _id: "B", property: "value" })
            maintenance.save({ _id: "C", property: "value" })

            maintenance.find({ _id: "A" }).explain(function(err, explanation) {
                if (err) throw err 
                assert.equal(explanation.nscanned, 1)
            })

            db.lastError(function(err, something) {
                if (err) throw err 
                assert.ok(true)
                assert.finish()
            })
        })
    })
}


exports.saving = function(assert) {
    var db, saving
    db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.saving')
    saving = db.mongo.saving

    saving.drop(function(err) {
        if (err) throw err 
        // Test guaranteed ordering

        saving.save({ _id: "A" })
        saving.save({ _id: "B" })
        saving.save({ _id: "C" })

        saving.find().toArray(function(err, docs) {
            if (err) throw err 
            assert.equal(docs.length, 3)
            // upsert

            saving.update({ _id: "D" }, { $set: { updated: "yep" } }, true, function(err, docs) {
                if (err) throw err 

                saving.update({ _id: "B" }, { _id: "B", updated: "yep" }, function(err, docs) {
                    if (err) throw err 

                    saving.update({ updated: "yep" }, { $set: { something: true } }, false, true, function(err, docs) {
                        if (err) throw err 

                        saving.find({ updated: "yep" }).count(function(err, count) {
                            if (err) throw err 
                            assert.equal(count, 2)
                        })

                        saving.find({ something: true }).count(function(err, count) {
                            if (err) throw err 
                            assert.equal(count, 2)
                        })

                        saving.remove({ something: true }, function(err) {
                            if (err) throw err 

                            saving.find().count(function(err, count) {
                                if (err) throw err 
                                assert.equal(count, 2)
                                // test inserting several

                                saving.insert([{ a: "E" }, { a: "F" }, { a: "G" }], function(err) {
                                    if (err) throw err 

                                    saving.find().count(function(err, count) {
                                        if (err) throw err 
                                        assert.equal(count, 5, "Inserting and count")
                                        assert.finish()
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}


exports.indexing = function(assert) {
    var coll, db
    db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.indexing')
    coll = db.mongo.indexing

    coll.drop(function(err) {
        if (err) throw err 
        // Test guaranteed ordering

        coll.insert({ _id: "A", property: 1, name: "bob" })
        coll.insert({ _id: "B", property: 2, name: "henry" })
        coll.insert({ _id: "C", property: 3, name: "bob" })

        coll.ensureIndex({ property: 1 }, function(err, name) {
            if (err) throw err 

            coll.find({ property: 2 }).explain(function(err, explanation) {
                if (err) throw err 
                assert.equal(explanation.nscanned, 1)

                coll.dropIndexes(function(err) {
                    if (err) throw err 

                    coll.find({ property: 2 }).explain(function(err, explanation) {
                        if (err) throw err 
                        assert.equal(explanation.nscanned, 3)
                        assert.finish()
                    })
                })
            })

            // coll.ensureIndex {name:1}, {unique: true}, (err, name) -> if err then throw err
        })
    })
}


exports.nextAndInsert = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.next')

    db.mongo.next.drop(function(err) {
        assert.ifError(err)

        db.mongo.next.find().next(function(err) {
            assert.ifError

            db.mongo.next.insert([{ _id: "next" }, { _id: "next2" }], function(err) {

                db.mongo.next.count(function(err, count) {
                    assert.ifError(err)
                    assert.notEqual(count, 1, "Insert only saved one document")
                    assert.equal(count, 2, "Insert saved unknown number " + count)

                    db.mongo.next.find().next(function(err, doc) {
                        assert.ifError(err)
                        assert.ok(doc)

                        db.mongo.next.find().limit(1).skip(1).next(function(err, doc) {
                            assert.ifError(err)
                            assert.ok(doc, "Missing second doc inserted")
                            assert.equal(doc._id, "next2")
                            assert.finish()
                        })
                    })
                })
            })
        })
    })
}


exports.dropping = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.dropping')

    db.mongo.dropping.save({ _id: "woot" }, function(err) {
        assert.ifError(err)
		
		db.connection = function(cb) {
			cb(null, {
				dropDatabase: function(cb) {
					cb()
				},
				done: function() {
					
				}
			})
		}
		
		db.dropDatabase(function(err) {
			assert.ifError(err)
        	assert.finish()
		})		
    })
}


exports.errors = function(assert) {
    var db, verifyError
    db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.errors')

    function verifyError(err, something) {
        assert.notEqual(err, null, "Missing Fake Error")
    }
    // db.mongo.errors.find().toArray verifyError
    // db.mongo.errors.find().explain verifyError
    // db.mongo.errors.find().each verifyError
    // db.mongo.errors.find().count verifyError
    // db.mongo.errors.find().next verifyError
    // db.mongo.errors.ensureIndex null, verifyError
    // db.mongo.errors.dropIndexes verifyError                
    // db.mongo.errors.insert null, verifyError        
    // db.mongo.errors.remove null, verifyError
    // db.mongo.errors.drop verifyError
    // db.mongo.errors.save null, verifyError
    // db.mongo.errors.update null, null, verifyError
    // db.mongo.errors.count verifyError 
    // db.lastError verifyError            

    // Why doesn't it ever hit the opening thing

    exports.noop = function(assert) {}
    db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.noop')
    // Mess it up
    // Give it a noop

    db.mongo.noop.save({ _id: "woot" })

    db.mongo.noop.find().toArray(function(err, docs) {
        assert.ok(true)
        assert.finish()
    })
}


exports.reopen = function(assert) {
    var db = mongo.db("localhost", 27017, "test")
    db.collection('mongo.reopen')

    db.mongo.reopen.save({ _id: "one" }, function(err, doc) {
        assert.ifError(err)

        db.mongo.reopen.find().toArray(function(err, docs) {
            assert.ifError(err)
            assert.ok(docs.length === 1, "Couldn't find doc in test reopen")
            assert.finish()
        })
    })
}


exports.collections = function(assert) {
    var db = mongo.db('localhost', 27017, 'test')
    db.collection('system.indexes')
    assert.equal('system.indexes', db.system.indexes.name(), "Mongo didn't work with a compound name")
    assert.equal('test', db.name(), "Mongo renamed the databases name of the compound index")
    assert.finish()
}

exports.reports = function(assert) {
    var db = mongo.db('localhost', 27017, 'test')
    db.collection('mongo.reports')
    
    db.mongo.reports.save({_id:"one"}, function(err, doc) {
        assert.ifError(err)
        var ops = db.outstandingCommands()
        assert.equal(ops, 0, "Commands still outstanding?")
        assert.finish()
    })
    
    assert.equal(db.outstandingCommands(), 1, "Should have one command outstanding")
}

exports.autoClose = function(assert) {
    var db = mongo.db('localhost', 27017, 'test')
    db.collection('mongo.autoclose')
    
    db.connection(function(err, connection) {
        assert.ifError(err)
        assert.ok(connection.toString())
        connection.done()
        setTimeout(function() {
            assert.ok(connection.invalid)
            assert.finish()
        }, mongo.AutoCloseTimeout*2)        
    })
}  

exports.objectId = function(assert) {
	var db = mongo.db('localhost', 27017, 'test')
    db.collection('mongo.objectId')

	db.mongo.objectId.save({key:"value"}, function(err, doc) {
		assert.ifError(err)       
		
		// test to see if it passes the id through
		db.mongo.objectId.findOne({_id: doc._id}, function(err, doc) {
			assert.ifError(err)
			assert.ok(doc)                     
			                              
			// now re-construct it
			var stringId = doc._id.toString()          
			var objectId = new mongo.ObjectID(stringId)
			
			db.mongo.objectId.findOne({_id: objectId}, function(err, doc) {
				assert.ifError(err)
				assert.ok(doc)                     
				assert.finish()   							                                                           
			})
		})
	})
}     

exports.reconnect = function(assert) {
    
    // Make sure we can recover from an error. 
    
    var db = mongo.db('localhost', 27017, 'test')
    db.collection('mongo.reconnect') 
    
    var collection = db.mongo.reconnect
    mongo.log = util.log
    
    db.connection(function(err, connection) {
        assert.ifError(err)
        assert.ok(connection)   
        
        connection.emit("error", "Fake Error")
        // connection.done()   
        
        // no, this doesn't explain why it couldn't reconnect on subsequent onces
        
        collection.save({woot:"true"}, function(err, doc) {
            assert.ifError(err)
            assert.ok(doc)
            assert.finish()
        })            
                             
    })
           
    // console.log("STOP MONGO NOW")
    // setTimeout(function() {
    //     collection.save({woot:"value"}, function(err, doc) {
    //         assert.ok(err, "Should have seen an error")                                     
    //         
    //         console.log("START MONGO AGAIN")
    //         setTimeout(function() {
    //                            
    //             collection.save({woot:"value"}, function(err, doc) {
    //                 assert.ifError(err)                                     
    //                 assert.ok(doc)
    //                 assert.finish()
    //             })
    //         }, 2000)
    //     })
    // }, 2000)
    // 

	
	
}


exports.backgroundIndex = function(assert) {
    var db = mongo.db('localhost', 27017, 'test')
    db.collection('mongo.bg')

    db.mongo.bg.save({one:"two"}, function(err, doc) {

        db.mongo.bg.ensureIndex({one: 1}, { background: true }, function(err) {
            assert.ifError(err) 

            var cursor = db.mongo.bg.find({one:"two"})
            cursor.explain(function(err, explanation) {
                assert.ifError(err)
                assert.finish()
            })
        })
    })
}



//module.exports = {authentication: exports.authentication}

if (module == require.main) {
	require('async_testing').run(__filename, [])
}
