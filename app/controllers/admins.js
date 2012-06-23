
var Admins = function () {
  var requireLogin = function (complete) {
    if (!this.session.get('login')) {
      this.redirect('/admin/login');
      return complete();
    }
    else {
      return complete();
    }
  };
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.before(requireLogin, { async: true, except: ['login'] });

  this.login = function (params) {
    if (this.params.method == "POST") {
      if (this.params.authorPassword == geddy.settings.authorPassword && this.params.authorEmail == geddy.settings.authorEmail) {
        this.session.set('login', true);
        this.redirect('/admin');
      }
      else {
        this.redirect('/admin/login');
      }
    }
    else {
      this.render({params: params});
    }
  };

  this.index = function (params) {
    var self = this;
    // Get the settings, drafts, and posts for the blog
    // TODO: Parallelize this shit
    geddy.model.adapter.Settings.load({}, function(err, settings) {
      geddy.model.adapter.Post.all({draft: true}, function(err, drafts) {
        geddy.model.adapter.Post.all({draft: false}, function(err, posts) {
          self.respond({
            settings: settings
          , drafts: drafts
          , posts: posts
          , params: params
          });
        });
      });
    });
  };

};

exports.Admins = Admins;

