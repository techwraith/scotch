
var Posts = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.index = function (req, resp, params) {
    var self = this;
    geddy.model.adapter.Post.all({draft: false}, {sort: {date: -1}}, function(err, posts){
      self.respond({posts: posts});
    });
  };

  this.add = function (req, resp, params) {
    this.respond({params: params});
  };

  this.create = function (req, resp, params) {
     var self = this
      , post = geddy.model.Post.create({
          title: params.title
        , slug: geddy.string.slugify(params.title)
        , html: geddy.marked(params.content)
        , content: params.content
        , draft: (params.draft && params.draft == 'false') ? false : true
        , date: params.date || new Date()
        , id: geddy.string.uuid(20)
        });
    post.save(function (err, data) {
      if (err) {
        params.errors = err;
        self.transfer('add');
      }
      else {
        self.redirect({controller: self.name});
      }
    });
  };

  this.show = function (req, resp, params) {
    var self = this;
    geddy.model.adapter.Post.load({slug: params.id}, function(err, post) {
      self.respond({post: post});
    });
  };

  this.edit = function (req, resp, params) {
    var self = this;
    geddy.model.adapter.Post.load({slug: params.id}, function(err, post) {
      self.respond({post: post, params: params});
    });
  };

  this.update = function (req, resp, params) {
    var self = this;
    geddy.model.adapter.Post.load({slug: params.id}, function(err, post) {
      post.title = params.title || post.title;
      post.slug = geddy.string.slugify(post.title);
      post.date = params.date || new Date();
      post.draft = (params.draft && params.draft == 'false') ? false : true;
      post.content = params.content || post.content;
      post.html = geddy.marked(post.content);
      post.save(function(){
        self.redirect({controller: this.name, id: params.id});
      });
    });
  };

  this.remove = function (req, resp, params) {
    var self = this;
    geddy.model.adapter.Post.load({slug: params.id}, function(err, post) {
      geddy.model.adapter.Post.remove(post.id, function(){
        self.redirect({controller: this.name});
      });
    });
  };

};

exports.Posts = Posts;

