/*
* Boilerplate setup/teardown code
* Exports the `proxy` method.
*/

(function () {
  var assert = require('assert')
  , _ = require('underscore')
  , utils = require('utilities')
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
  /**
  * Proxies your tests with setup/teardown code
  * @param {string} modelName - The name of your model as in `geddy.model.<modelName>`. Don't forget to capitalize the first letter.
  * @param {array} tests - The array of test functions. Assumes they're all async, so don't forget the `next` parameter.
  */
  , proxy = function (modelName, tests) {
    /*
    * Proxy all tests with setup and teardown calls
    */
    _.each(tests, function(test, key) {
      var self=this
        , oldTest = test  //Proxies the old test function
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
  
  module.exports = {
    proxy: proxy
  }
}());
