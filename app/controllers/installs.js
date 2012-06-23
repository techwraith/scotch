
var Installs = function () {
  this.respondsWith = ['html', 'json', 'xml', 'js', 'txt'];

  this.install = function (params) {
    this.respond({params: params});
  };

  this.finish = function (params) {
    this.params.enableComments = (this.params.enableComments == 'false') ? false : true;
    this.params.approveComments = (this.params.approveComments == 'false') ? false : true;
    var self = this
      , settings = geddy.model.Settings.create(this.params);
    settings.save(function (err, data) {
      if (err) {
        this.params.errors = err;
        self.transfer('index');
      }
      else {
        self.redirect({controller: 'Posts', action: 'add'});
      }
    });

  };

};

exports.Installs = Installs;

