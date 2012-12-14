var Dashboards = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];
  // this.respondsWith = ['json'];

  this.main = function (req, resp, params) {
    // get all posts that are drafts
    // get all posts that are published
    // respond
    this.respond({params: params});
  };

  this.install = function (req, resp, params) {
    params.site = {};
    this.respond(params);
  };

  this.finish = function (req, resp, params) {
    params.id = params.id || geddy.string.uuid(10);

    var self = this
      , site = geddy.model.Site.create(params);

    site.save(function(err, data) {
      if (err) {
        params.errors = err;
        self.transfer('add');
      } else {
        geddy.installed = true;
        self.session.set('site', site);
        self.redirect('/dashboard');
      }
    });
    // TODO: implement a site check in init.js
  };

  this.analytics = function (req, resp, params) {
    // get all posts that have been published
    // get visits for each of them
    // get unique visitors
    // respond
    this.respond({params: params});
    // TODO: set up realtime counts for visits and unique visitors
  };

  this.login = function (req, resp, params) {
    this.respond({params: params});
  };

  this.authenticate = function (req, resp, params) {
    // get site
    // if password and email === site info
    //   set this.session.set('user', site);
    // else
    //   redirect to login
    this.session.set('user', true);
    this.redirect('/dashboard');
  };

};

exports.Dashboards = Dashboards;

