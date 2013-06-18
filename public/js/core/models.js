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

var _ = require('underscore');

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

    if (!this.isPublished || this.isPublished == 'false') {
      this.isPublished = false;
    } else {
      this.isPublished = true;
    }

    if (!this.slug) {
      this.slug = geddy.string.sluggerize(this.title);
    }
    this.html = geddy.string.md(this.markdown);

    // in case we call this manually and want to chain
    // then again, who's crazy enough to need that?
    return this;

  };
  
  /**
  * Post-processes the post HTML using the user's plugins
  * @param {string} scenario - Where the post will be displayed. Could be "index" or "show".
  */
  this.formatHtml = function (scenario) {
    var buffer = this.html
      , formatter
      , i
      , ii;
    
    _.each(geddy.config.plugins.formatters, function(formatterName) {
      formatter = require(formatterName);
      
      if(typeof formatter[scenario] === 'function') {
        buffer = formatter[scenario].apply(this,[buffer]);
      }
    }, this);
    
    return buffer;
  };
  
  /*
  * Use in place of the default toObj
  */
  this.toFormattedObj = function (scenario) {
    var objectified = this.toObj();
    
    if(scenario) {
      objectified.html = this.formatHtml.apply(this,[scenario]);
    }
    
    return objectified;
  };
};

Post = geddy.model.register('Post', Post);

}());

(function () {
var Site = function () {

  this.defineProperties({
    title: {type: 'string'},
    twitter: {type: 'string'},
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