/*
* Boilerplate setup/teardown code
* Exports the `proxy` method.
*/

(function () {
  var assert = require('assert')
  , _ = require('underscore')
  , utils = require('utilities')
  , path = require('path')
  /*
  * Removes all posts, run before and after each test
  */
  , cleanup = function (modelName, next) {
      var removes = []
        , chain
        , Model
        , plural = utils.inflection.pluralize(modelName)
        , singular = utils.inflection.singularize(modelName);
      
      Model = geddy.model[modelName];
      
      //Wipe out all existing posts
      Model.all(function (err, models) {
        assert.strictEqual(err, null, 'Setup: Could not fetch '+plural);
        
        if(models.length) {
          removes = _.map(models, function (item) {
            return {
              func: Model.remove
            , args: [item.id]
            , callback: null
            };
          });
          
          chain = new utils.async.AsyncChain(removes);
          
          chain.last = function () {
            Model.all(function (err, models) {
              assert.strictEqual(err, null, 'Setup: Could not check if '+plural+' were removed');
              
              assert.strictEqual(0, models.length, 'Setup: '+plural+' weren\'t removed');
              
              next();
            });
          }
          
          chain.run();
        }
        else {
          next();
        }
      });
    }
  
  /*
  * Starts a geddy server
  */
  , startGeddy = function (next) {
      var spawn = require('child_process').spawn
        , cmd = path.join(__dirname,'../','node_modules','geddy','bin','cli')+'.js'
        , opts = ['--port','8080']
        , server
        , notified = false;
      
      server = spawn(cmd, opts);
      
      server.stderr.setEncoding('utf8');
      
      server.stderr.on('data', function (data) {
        if (/^execvp\(\)/.test(data)) {
          assert.ok(false, 'Failed to start geddy server');
        }
      });

      server.stdout.on('data', function (data) {
        var ready = data.toString().match(/Server worker running in [a-z]+? on port [0-9]+? with a PID of: [0-9]+?/)?true:false;
        
        if(!notified && ready) {
          notified = true;
          
          next(server);
        }
      });
    }
  
  /*
  * Kills a geddy server
  */
  , killGeddy = function (server, next) {
    server.on('close', function (code) {
      next();
    });
    
    server.kill("SIGHUP");
  }
  
  /**
  * Proxies your tests with setup/teardown code for model tests
  * @param {string} modelName - The name of your model as in `geddy.model.<modelName>`. Don't forget to capitalize the first letter.
  * @param {array} tests - The array of test functions. Assumes they're all async, so don't forget the `next` parameter.
  */
  , proxyModelTests = function (modelName, tests) {
    
    var self = this;
    
    _.each(tests, function(test, key) {
      var oldTest = test  //Proxies the old test function
        , oldNext;        //Proxies the old next function
      
      tests[key] = function (next) {
        oldNext = next;
        
        //Run cleanup after test completes
        next = function () {
          cleanup(modelName, function () {
            oldNext.apply(self, arguments);
          });
        };
        
        //Run cleanup before test runs
        cleanup(modelName, function () {
          oldTest.apply(self, [next]);
        });
      };
    });
    
    return tests;
  }
  
  /**
  * Proxies your tests with setup/teardown code for geddy tests
  * @param {array} tests - The array of test functions. Assumes they're all async, so don't forget the `next` parameter.
  */
  , proxyGeddyTests = function (tests) {
    
    var self = this;
    
    _.each(tests, function(test, key) {
      var oldTest = test  //Proxies the old test function
        , oldNext;        //Proxies the old next function
      
      tests[key] = function (next) {
        oldNext = next;
        
        //Run cleanup before test runs
        startGeddy(function (server) {
          //Run cleanup after test completes
          next = function () {
            killGeddy(server, function () {
              oldNext.apply(self, arguments);
            });
          };
          
          oldTest.apply(self, [next]);
        });
      };
    });
    
    return tests;
  };
  
  module.exports = {
    proxyModelTests: proxyModelTests
  , proxyGeddyTests: proxyGeddyTests
  }
}());
