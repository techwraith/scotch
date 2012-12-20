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
        self.redirect('/dashboard');
      }
    });
  };

  this.show = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first({slug: params.slug}, function(err, post) {
      if (err || !post) {
        return self.redirect('/');
      }
      self.respond({params: params, post: post.toObj()});
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first(params.id, function(err, post) {
      self.respond({params: params, post: post});
    });
  };

  this.update = function (req, resp, params) {
    var self = this;

    geddy.model.Post.first(params.id, function(err, post) {
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
