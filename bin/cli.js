#!/usr/bin/env node

var program = require('commander')
  , utils = require('utilities')
  , path = require('path')
  , geddy = require('geddy');

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

  this.serve = function (port) {
    console.log('Serving on port 80');
    console.log(process.cwd())
    geddy.start({
      environment: 'development'
    , port: 80
    , 'geddy-root': process.cwd()
    });
  };

  this.generate = function () {
    console.log('generated static site in ./static');
  };

}
var actions = new Controller();

if (program.create) return actions.create(program.create);
if (program.serve) return actions.serve();
if (program.generate) return actions.generate();
