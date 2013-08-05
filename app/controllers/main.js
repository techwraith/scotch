var _ = require('underscore');

var Main = function () {
  this.index = function (req, resp, params) {
    // get the post that:
    //   - is not a draft
    //   - is the latest updated
    //   - is marked as being a home page
    // if there is not post that matches
    //  get the latest post that is not a draft
    //  respond
    var self = this;
    geddy.model.Post.all({isPublished: true}, {sort: {'publishedAt': 'desc'}}, function (err, posts){
      posts = _.map(posts, function (post, key) {
        return post.toFormattedObj(params.action);
      }, this);

      self.respond({post: posts[0], posts: posts}, {
        format: 'html'
      , template: 'app/views/posts/show'
      });
    });
  };
};

exports.Main = Main;
