// Check if there is a site in the DB and set geddy.installed to true if it is
geddy.model.Site.first(function(err, site) {
  if (err && err.message.indexOf('failed to connect') > -1 ) {
    geddy.log.error('Failed to connect to mongo, please make sure it is running.')
    process.exit();
  }
  if (!err && site) {
    geddy.installed = true;
    geddy.site = site;
  }
});

// Add uncaught-exception handler in prod-like environments
if (geddy.config.environment != 'development') {
  process.addListener('uncaughtException', function (err) {
    var msg = err.message;
    if (err.stack) {
      msg += '\n' + err.stack;
    }
    if (!msg) {
      msg = JSON.stringify(err);
    }
    geddy.log.error(msg);
  });
}

