(function () {
geddy.string.sluggerize = require('slugs');
geddy.string.md = require('marked');
geddy.string.highlight = require('highlight').Highlight;

geddy.string.md.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: false,
  // callback for code highlighter
  highlight: function(code, lang) {
    return geddy.string.highlight(code);
  }
});

var Post = function () {

  this.defineProperties({
    title: {type: 'string', required: true},
    slug: {type: 'string'},
    markdown: {type: 'string'},
    html: {type: 'string'},
    isPublished: {type: 'boolean'},
  });

  this.belongsTo('Site');
  this.hasMany('Visits');

  this.afterCreate = function () {

    if (!this.title) {
      this.title = "Untitled Post";
    }

    if (!this.markdown) {
      this.markdown = "**Draft**";
    }

    /*
     * TODO: implement publishing logic
     *
    if (!this.isPublished) {
      this.isPublished = false;
    }
    else {
    */
    this.isPublished = true;
    /*
    }
    */

    this.slug = geddy.string.sluggerize(this.title);
    this.html = geddy.string.md(this.markdown);

    // in case we call this manually and want to chain
    // then again, who's crazy enough to need that?
    return this;

  };

};

Post = geddy.model.register('Post', Post);

}());

(function () {
var Site = function () {

  this.defineProperties({
    title: {type: 'string'},
    firstName: {type: 'string'},
    lastName: {type: 'string'},
    email: {type: 'string'},
    password: {type: 'string'},
  });

  this.hasMany('Posts')

};

User = geddy.model.register('Site', Site);

}());

(function () {
var Visit = function () {

  this.defineProperties({
  });

  /*
  this.property('login', 'string', {required: true});
  this.property('password', 'string', {required: true});
  this.property('lastName', 'string');
  this.property('firstName', 'string');

  this.validatesPresent('login');
  this.validatesFormat('login', /[a-z]+/, {message: 'Subdivisions!'});
  this.validatesLength('login', {min: 3});
  // Use with the name of the other parameter to compare with
  this.validatesConfirmed('password', 'confirmPassword');
  // Use with any function that returns a Boolean
  this.validatesWithFunction('password', function (s) {
      return s.length > 0;
  });

  // Can define methods for instances like this
  this.someMethod = function () {
    // Do some stuff
  };
  */

};

/*
// Can also define them on the prototype
Visit.prototype.someOtherMethod = function () {
  // Do some other stuff
};
// Can also define static methods and properties
Visit.someStaticMethod = function () {
  // Do some other stuff
};
Visit.someStaticProperty = 'YYZ';
*/

Visit = geddy.model.register('Visit', Visit);

}());

(function () {
var Visitor = function () {

  this.defineProperties({
    latestIP: {type: 'string'},
    sessionID: {type: 'string'},
  });

  /*
  this.property('login', 'string', {required: true});
  this.property('password', 'string', {required: true});
  this.property('lastName', 'string');
  this.property('firstName', 'string');

  this.validatesPresent('login');
  this.validatesFormat('login', /[a-z]+/, {message: 'Subdivisions!'});
  this.validatesLength('login', {min: 3});
  // Use with the name of the other parameter to compare with
  this.validatesConfirmed('password', 'confirmPassword');
  // Use with any function that returns a Boolean
  this.validatesWithFunction('password', function (s) {
      return s.length > 0;
  });

  // Can define methods for instances like this
  this.someMethod = function () {
    // Do some stuff
  };
  */

};

/*
// Can also define them on the prototype
Visitor.prototype.someOtherMethod = function () {
  // Do some other stuff
};
// Can also define static methods and properties
Visitor.someStaticMethod = function () {
  // Do some other stuff
};
Visitor.someStaticProperty = 'YYZ';
*/

Visitor = geddy.model.register('Visitor', Visitor);

}());