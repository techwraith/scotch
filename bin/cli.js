#!/usr/bin/env node

var program = require('commander')
  , utils = require('utilities')
  , path = require('path')
  , geddy = require('geddy')
  , _ = require('underscore')
  , request = require('request')
  , fs = require('fs');

program
  .option('create <name>', 'create a new directory (<name>) and generate a new Scotch site in it.')
  .option('serve', 'start the server')
  .option('generate', 'generate a static html site')
  .parse(process.argv);


var Controller = function () {

  this.create = function (name) {
    console.log('Created a new site in directory: ' + program.create);
    utils.file.cpR(path.join(__dirname, '..'), name, {silent: true});
    utils.file.rmRf(path.join(name, '.git'), {silent: true});
    utils.file.rmRf(path.join(name, '.gitignore'), {silent: true});
  };

  this.serve = function () {
    console.log('Serving on port 80');
    console.log(process.cwd())
    geddy.start({
      environment: 'production'
    , 'geddy-root': process.cwd()
    });
  };

  this.generate = function () {
    console.log('generated static site in ./static');
    utils.file.cpR(path.join(process.cwd(), 'public'), 'static', {silent: true});
    geddy.start({'geddy-root': process.cwd(), 'port': 8080});
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

}
var actions = new Controller();

if (program.create) return actions.create(program.create);
if (program.serve) return actions.serve();
if (program.generate) return actions.generate();
