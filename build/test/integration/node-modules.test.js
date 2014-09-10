'use strict';

/* global suite, test, require, process */

var assert = require('chai').assert;
var rmrf = require('rimraf').sync;
var fs = require('fs');
var path = require('path');
var helper = require('./helper');

suite('Node modules tests', function() {
  test('make node_modules from git mirror', function(done) {
    var gitUrl = 'https://git.mozilla.org/b2g/gaia-node-modules.git';
    rmrf('modules.tar');
    rmrf('node_modules');
    rmrf('git-gaia-node-modules');
    helper.exec('NODE_MODULES_GIT_URL=' + gitUrl + ' make node_modules',
      function(error, stdout, stderr) {
        helper.checkError(error, stdout, stderr);

        var modulesTarPath = path.join(process.cwd(), 'git-gaia-node-modules',
          '.git');
        assert.ok(fs.existsSync(modulesTarPath));

        var packageJson = path.join(process.cwd(), 'node_modules',
          'marionette-client', 'package.json');
        assert.ok(fs.existsSync(packageJson));

        done();
    });
  });

  test('make node_modules from github', function(done) {
    rmrf('modules.tar');
    rmrf('node_modules');
    rmrf('git-gaia-node-modules');
    helper.exec('make node_modules',
      function(error, stdout, stderr) {
        helper.checkError(error, stdout, stderr);

        var modulesTarPath = path.join(process.cwd(), 'modules.tar');
        assert.ok(fs.existsSync(modulesTarPath));

        var packageJson = path.join(process.cwd(), 'node_modules',
          'marionette-client', 'package.json');
        assert.ok(fs.existsSync(packageJson));

        done();
    });
  });
});