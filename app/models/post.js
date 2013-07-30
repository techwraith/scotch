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
    publishedAt: {type: 'datetime'}
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

    if(!this.publishedAt) {
      this.publishedAt = new Date();
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

