(function () {
  var assert = require('assert')
  , path = require('path')
  , request = require('request')
  , tests
  , init = require(path.join('../','init'))
  , baseUrl = "http://localhost:8080"
  , reqOpts = {
      timeout: 1000
    };

  tests = {
    "test index": function(next) {
      //Request index
      request(baseUrl, reqOpts, function(err, res, body) {
        assert.strictEqual(err, null, err);
        assert.strictEqual(res.statusCode, 200, 'Error '+res.statusCode+' when requesting blog index');
        next();
      });
    }
  };
  
  module.exports = init.proxyGeddyTests(tests);
}());