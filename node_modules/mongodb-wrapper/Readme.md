[node-mongodb-native]: https://github.com/christkv/node-mongodb-native     
[javascript driver]: http://www.mongodb.org/display/DOCS/Manual
[docs]: http://www.mongodb.org/display/DOCS/Manual

# node-mongodb-wrapper

A wrapper for [node-mongodb-native][node-mongodb-native] as close as possible to the [native javascript driver][javascript driver]. Why learn two interfaces?

Yes, we know other people are doing the same thing. This one has been easier to use. 

## Features

1. Minimal interface closely matching the command-line driver: [http://www.mongodb.org/display/DOCS/Manual][docs]
2. Lazy open/close of connections
3. Most features of [node-mongodb-native][node-mongodb-native]

## Installation

<pre>
  npm install mongodb-wrapper
</pre>

## Usage

1. You have to tell the db object which collections you're about to use (Harmony Proxies, I need you!)
2. You have to provide callbacks on "actionable" calls (`toArray`, `count`, but not `find`)
3. Otherwise, just like the native [javascript driver][javascript driver]

<pre>
	var mongo = require('mongodb-wrapper')
	var db = mongo.db('localhost', 27017, 'test')
	db.collection('posts')
	
	db.posts.save({title: "A new post", body: "Here is some text"}, function(err, post) {
		db.posts.findOne({_id: doc._id}, function(err, post) {
			db.posts.find().limit(1).toArray(function(err, posts) {
				// posts[0].title == "A new post"
			})
		})
	})      
</pre>

For more examples, [please look at the test suite](https://github.com/idottv/node-mongodb-wrapper/blob/master/lib/mongodb-wrapper.js)

## Documentation

Remember the guiding principle: the syntax exactly matches the [command-line driver][docs], except you pass a call back to any funciton that hits the database. 

#### Connecting

`mongo.db(host, port, dbname, [prefix], [username], [password])` - returns an unopened database object. 
* If prefix is specified all collections will use the prefix in mongo, but you refer to them without the prefix in node. 
* If username and password are specified, it will attempt to authenticate. 

`db.collection(name)` - Returns a `Collection` object. Also creates `db[name]` so you can do this:
    
    db.collection('user')
    db.users.count(cb)


#### Authentication

`db.auth(username, password, cb)` - You can pass `username` and `password` into mongo.db instead of calling this manually

`db.addUser(username, password, cb)`

`db.removeUser(username, password, cb)`

#### Database 

`db.dropDatabase(cb)`

`db.lastError(cb)` - `cb(err, lastError)`

`db.eval(code, [parameters], cb)`

`db.createCollection(name, options, cb)` - allows you to create a collection by hand if you want to specify the options

### Collection

`collection.ensureIndex(index, options, cb)`

`collection.dropIndexes(cb)`

`collection.renameCollection(newName, dropTarget, cb)`

`collection.insert(doc(s), cb)`

`collection.remove(selector, cb)`

`collection.drop(cb)`

`collection.save(doc, cb)`

`collection.update(selector, updates, [upsert], [multi], cb)`

`collection.count(cb)`

`collection.findAndModify(options, cb)`

`collection.find(selector, fields)` - Returns a `Cursor`

`collection.findOne(selector, fields, cb)`

`collection.group(options, cb)`

`collection.mapReduce(map, reduce, options, cb)` - map and reduce can be functions, it will toString them for you. 

`collection.distinct(key, [query], cb)`

### Cursor

`cursor.limit(num)` 

`cursor.skip(num)`

`cursor.sort({field:1})`

`cursor.next(cb)`

`cursor.explain(cb)`

`cursor.toArray(cb)`

`cursor.count(cb)`

### Useful Exports

`mongo.ObjectID` - you need to wrap any string ids in this class to match on `_id`

