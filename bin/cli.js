#!/usr/bin/env node

var program = require('commander')
  , utils = require('utilities')
  , path = require('path')
  , geddy = require('geddy')
  , _ = require('underscore')
  , request = require('request')
  , envoy = require('envoy')
  , kitten = require('kitten')
  , fs = require('fs');

program
  .option('create <name>', 'create a new directory (<name>) and generate a new Scotch site in it.')
  .option('serve [port]', 'start the server, defaults to 80', 80)
  .option('generate', 'generate a static html site')
  .option('import [folder]', 'import markdown files from folder')
  .option('deploy', 'deploys a generated site')
  .option('upgrade', 'upgrades a site\'s database')
  .parse(process.argv);

var Controller = function () {

  this.create = function (name) {
    console.log('Created a new site in directory: ' + program.create);
    utils.file.cpR(path.join(__dirname, '..'), name, {silent: true});
    utils.file.rmRf(path.join(name, '.git'), {silent: true});
    utils.file.rmRf(path.join(name, '.gitignore'), {silent: true});
  };

  this.serve = function (port) {
    port = port || 80;
    console.log('Serving on port ' + port);
    console.log(process.cwd())
    geddy.start({
      'geddy-root': process.cwd()
    , port: port
    });
  };

  this.generate = function () {
    console.log('generated static site in ./static');
    utils.file.cpR(path.join(process.cwd(), 'public'), 'static', {silent: true});
    geddy.start(
    {
      'geddy-root': process.cwd()
    , 'port': 8080
    });
    geddy.model.Post.all({isPublished: true}, {sort: {createdAt: 'asc'}}, function (err, posts) {
      if (err) return console.log(err);
      var slugs = _.pluck(posts, 'slug')
        , done = _.after(slugs.length, function () {
            request('http://localhost:8080/')
            .on('end', function () {
              console.log('done');
              process.exit();
            })
            .pipe(fs.createWriteStream(path.join('static', 'index.html')))
          });
      for (var i in slugs) {
        (function (slug, i) {
          request('http://localhost:8080/'+slug)
                  .on('end', done)
                  .pipe(fs.createWriteStream(path.join('static', slug+'.html')))
        })(slugs[i], i);
      }
    });
  };

  this['import'] = function (folder) {
    var chain = []
      , asyncChain
      , createPost = function (params, cb) {
          var post = geddy.model.Post.create(params);

          if(post.isValid()) {
            post.save(cb);
          }
          else {
            cb(post.errors);
          }
        };

    kitten.load(folder, function (err, posts) {
      if(err) {
        console.error('failed to import: ' + err);
        return;
      }

      geddy.start(
      {
        'geddy-root': process.cwd()
      , 'port': 8080
      });

      _.each(posts, function (post) {
        var params = {
          title: post.title
        , markdown: post.content
        , isPublished: post.published
        , publishedAt: post.date
        , callback: null
        };

        if(post.layout === 'post') {
          chain.push({
            func: createPost
          , args: [params]
          });
        }
        else {
          console.log('ignoring the page ' + post.name + ', set `layout: post` to import');
        }
      });

      asyncChain = new utils.async.AsyncChain(chain);

      asyncChain.last = function () {
        console.log('imported ' + chain.length + ' posts');
        process.exit(0);
      }

      asyncChain.run();
    });
  };

  /*
  * As of right now, this will just copy the createdAt field over to
  * the publishedAt field
  */
  this.upgrade = function () {

    console.log('upgrading database to latest version');

    var upgradePost = function (post, cb) {
          post.publishedAt = post.createdAt;

          post.save(cb);
        }
      , chain = []
      , asyncChain;

    geddy.start(
    {
      'geddy-root': process.cwd()
    , 'port': 8080
    });

    geddy.model.Post.all(function (err, posts) {
      _.each(posts, function (post) {
        chain.push({
          func: upgradePost
        , args: [post]
        , callback: null
        });
      });

      asyncChain = new utils.async.AsyncChain(chain);

      asyncChain.last = function () {
        console.log('upgraded ' + posts.length + ' posts');

        process.exit(0);
      };

      asyncChain.run();
    });
  };

  this.deploy = function () {
    var deployOpts
      , staticSiteDir = path.join(process.cwd(),'static')
      , deployOptsFile = path.join(process.cwd(),'config','deployment')
      , now = (new Date).getTime()
      , elapsed;

    //Check if static site has been generated
    if(!fs.existsSync(staticSiteDir)) {
      console.error('no static site detected');
      console.error('generate a static site with `scotch generate`');
      process.exit(1);
    }

    try {
      deployOpts = require(deployOptsFile);
    }
    catch (e) {
      console.error('could not load deployment settings');
      console.error('see: https://github.com/Techwraith/scotch#deployment');
      process.exit(1);
    }

    if(!deployOpts) {
      return;
    }

    deployOpts = _.clone(deployOpts);

    deployOpts.destination = deployOpts.destination || 'memory';
    deployOpts.opts = deployOpts.opts || {};

    console.log('deploying static site using ' + deployOpts.destination);

    envoy.deployFolder(staticSiteDir, deployOpts.destination, deployOpts.opts, function (err, log) {
      if(err) {
        console.error('failed to deploy: '+err);
        process.exit(1);
      }
      else {
        elapsed = (new Date).getTime() - now;

        elapsed = Math.round(elapsed/100)/10;

        console.log('deployed in ' + log.length + ' operations (' + elapsed + ' sec)');
        process.exit(0);
      }
    });
  };
}
var actions = new Controller();

if (program.create) return actions.create(program.create);
if (program.generate) return actions.generate();
if (program.deploy) return actions.deploy();
if (program.upgrade) return actions.upgrade();
if (program['import']) return actions['import'](program['import']);
if (program.serve) return actions.serve(program.serve);
