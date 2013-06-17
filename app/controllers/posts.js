var _ = require('underscore');

var Posts = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.index = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first({isPublished: true}, {sort: {createdAt: 'asc'}}, function(err, posts) {
      self.respond({params: params, posts: posts});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
    params.id = params.id || geddy.string.uuid(10);

    var self = this
      , post = geddy.model.Post.create(params);

    post.save(function(err, data) {
      if (err) {
        params.errors = err;
        self.transfer('add');
      } else {
        if (data.isPublished) {
          self.redirect('/'+data.slug);
        } else {
          self.redirect('/dashboard#drafts')
        }
      }
    });
  };

  this.show = function (req, resp, params) {
    var self = this
      , current, next, previous;

    geddy.model.Post.all({isPublished: true}, {sort: {'createdAt': 'desc'}}, function (err, posts){
      current = _.find(posts, function(post){ return post.slug == params.slug});
      if (current) {
        current = current.toFormattedObj(params.action);
      } else {
        return self.redirect('/');
      }
      for (var i in posts) {
        if (posts[i].slug == current.slug) {i
          next = posts[parseInt(i)-1] ? posts[parseInt(i)-1].toObj() : null;
          previous = posts[parseInt(i)+1] ? posts[parseInt(i)+1].toObj() : null;
        }
      }
      self.respond({params: params, post: current, previous: previous, next: next});
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first({slug: params.slug}, function(err, post) {
      self.respond({params: params, post: post});
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first({slug: params.slug}, function(err, post) {
      if (params.isPublished!=null && (params.isPublished === true || params.isPublished === 'true')) {
        params.isPublished = true;
      } else {
        params.isPublished = false;
      }
      post.updateProperties(params);

      post.save(function(err, data) {
        if (err) {
          params.errors = err;
          self.transfer('edit');
        } else {
          self.redirect('/dashboard');
        }
      });
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;

    geddy.model.Post.remove(params.id, function(err) {
      if (err) {
        params.errors = err;
        self.transfer('edit');
      } else {
        self.redirect('/dashboard');
      }
    });
  };

};

exports.Posts = Posts;
