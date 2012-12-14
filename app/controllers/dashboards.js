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
    this.respond({params: params});
  };

  this.finish = function (req, resp, param) {
    // save params for site
    // set geddy.installed to true
    geddy.installed = true;
    // TODO: implement a site check in init.js
    this.session.set('user', true);
    this.redirect('/dashboard');
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

