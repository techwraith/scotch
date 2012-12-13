var Dashboards = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];
  // this.respondsWith = ['json'];

  this.main = function (req, resp, params) {
    this.respond({params: params});
  };

  this.install = function (req, resp, params) {
    this.respond({params: params});
  };

  this.finish = function (req, resp, param) {
    geddy.installed = true;
    this.session.set('user', true);
    this.redirect('/dashboard');
  };

  this.analytics = function (req, resp, params) {
    this.respond({params: params});
  };

  this.login = function (req, resp, params) {
    this.respond({params: params});
  };

  this.authenticate = function (req, resp, params) {
    this.session.set('user', true);
    this.redirect('/dashboard');
  };

};

exports.Dashboards = Dashboards;

