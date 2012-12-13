geddy.string.sluggerize = require('slugs');
geddy.string.md = require('marked');
geddy.string.highlight = require('highlight').Highlight;

geddy.string.md.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: true,
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

    if (!this.isPublished) {
      this.isPublished = false;
    }
    else {
      this.isPublished = true;
    }

    this.slug = geddy.string.sluggerize(this.title);
    this.html = geddy.string.md(this.markdown);

    // in case we call this manually and want to chain
    // then again, who's crazy enough to need that?
    return this;

  };

};

Post = geddy.model.register('Post', Post);

