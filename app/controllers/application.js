/*
 * Geddy JavaScript Web development framework
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

var Application = function () {

  // Redirect a request if a simple boolean check doesn't pass
  this.redirectTo = function (route, condition, callback) {
    var self = this;
    return {
      unless: function (condition, callback) {
        if (condition) {
          return callback();
        }
        else {
          return self.redirect(route);
        };
      }
    };
  };

  // check if scotch has been set up
  var checkInstall = function (next) {
    return this.redirectTo('/dashboard/install').unless(geddy.installed, next);
  };

  // check if the user has signed in
  var checkAuth = function (next) {
    return this.redirectTo('/dashboard/login').unless(this.session.get('site'), next);
  };

  this.before(checkInstall, {except: ['install', 'finish'], async: true});
  this.before(checkAuth, {except: ['index', 'show', 'list', 'login', 'authenticate', 'install', 'finish'], async: true});

};

exports.Application = Application;



