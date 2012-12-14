var Main = function () {
  this.index = function (req, resp, params) {
    // get the post that:
    //   - is not a draft
    //   - is the latest updated
    //   - is marked as being a home page
    // if there is not post that matches
    //  get the latest post that is not a draft
    //  respond
    this.respond(params, {
      format: 'html'
    , template: 'app/views/main/index'
    });
  };
};

exports.Main = Main;
