const assert = require('chai').assert;
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const rmrf = require('rimraf').sync;
const helper = require('./helper');

const DIST_DIR = 'distribution-test'

function getTestData(appsConfig) {
  return [
    {
      // SMS
      path: ['apps', 'sms', 'js', 'blacklist.json'],
      expected: appsConfig.sms.blacklist
    }, {
      // Sensors
      path: ['apps', 'settings', 'resources', 'sensors.json'],
      expected: appsConfig.sensors
    }, {
      // Network Types
      path: ['apps', 'settings', 'resources', 'network.json'],
      expected: appsConfig.network
    }, {
      // ICC / STK
      path: ['apps', 'system', 'resources', 'icc.json'],
      expected: appsConfig.icc
    }, {
      // WAP UA profile url
      path: ['apps', 'system', 'resources', 'wapuaprof.json'],
      expected: appsConfig.wapuaprof
    }, {
      // WAP Push
      path: ['apps', 'wappush', 'js', 'whitelist.json'],
      expected: appsConfig.wappush.whitelist
    }
  ];
}

suite('make applications-data', function() {
  suiteSetup(function() {
    rmrf('profile');
    rmrf(DIST_DIR)
  })

  test('without any environment variable', function(done) {
    exec('make applications-data', function(error, stdout, stderr) {
      helper.checkError(error, stdout, stderr);

      var appsConfig = JSON.parse(fs.readFileSync(path.join('build', 'config',
        'apps-config.json')));

      // homescreen
      var hsConfig = JSON.parse(fs.readFileSync(path.join('build', 'config',
        'homescreen.json')));
      var hsInit = JSON.parse(fs.readFileSync(path.join('apps', 'homescreen',
        'js', 'init.json')));
      hsConfig.homescreens.forEach(function(section, i) {
        section.forEach(function(app, j) {
          if (app[0].indexOf('apps/homescreen/collections') !== -1) {
            assert.equal(hsInit.grid[i][j].manifestURL,
              'app://homescreen.gaiamobile.org/collections/' + app[1] +
              '/manifest.collection');
          } else if(app[1] !== 'marketplace.firefox.com') {
            assert.equal(hsInit.grid[i][j].manifestURL,
              'app://' + app[1] + '.gaiamobile.org/manifest.webapp');
          }
        });
      });

      var testData = getTestData(appsConfig);
      testData.push({
          // Communications config
          path: ['apps', 'communications', 'contacts', 'config.json'],
          expected: JSON.parse(fs.readFileSync(path.join('build', 'config',
            'contacts.json')))
      });
      testData.push({
          // Browser
          path: ['apps', 'browser', 'js', 'init.json'],
          expected: JSON.parse(fs.readFileSync(path.join('build', 'config',
            'browser.json')))
      });

      testData.forEach(function(data) {
        var actual = JSON.parse(fs.readFileSync(path.join.apply(null,
          data.path)));
        assert.deepEqual(actual, data.expected);
      })

      // Support
      var supportContent = fs.readFileSync(path.join('apps', 'settings',
        'resources', 'support.json'));
      assert.equal(supportContent, '');

      // Calendar
      var sandbox = { Calendar: {} };
      var calendarPresetsJs = fs.readFileSync(path.join('apps', 'calendar', 'js',
        'presets.js'));
      var expectedCalendar = JSON.parse(fs.readFileSync(path.join('build',
        'config', 'calendar.json')));
      vm.runInNewContext(calendarPresetsJs, sandbox);
      assert.deepEqual(sandbox.Calendar.Presets, expectedCalendar);

      done();
    });
  });

  test('with GAIA_DISTRIBUTION_DIR', function(done) {
    fs.mkdirSync(DIST_DIR);

    var expectedConfig = {
      'sms': { 'blacklist': ['1234', '5678'] },
      'sensors': { 'ambientLight': false },
      'network': {
        'types': [
          'wcdma/gsm/cdma/evdo'
        ]
      },
      'icc': {
        'defaultURL': 'http://example.com/'
      },
      'wapuaprof': {
        "000000": { "url": "http://example.url/default.xml" }
      },
      'wappush': { 'whitelist': ['1234'] }
    };

    fs.writeFileSync(path.join(DIST_DIR, 'sms-blacklist.json'),
      JSON.stringify(expectedConfig.sms.blacklist));
    fs.writeFileSync(path.join(DIST_DIR, 'sensors.json'),
      JSON.stringify(expectedConfig.sensors));
    fs.writeFileSync(path.join(DIST_DIR, 'network.json'),
      JSON.stringify(expectedConfig.network));
    fs.writeFileSync(path.join(DIST_DIR, 'icc.json'),
      JSON.stringify(expectedConfig.icc));
    fs.writeFileSync(path.join(DIST_DIR, 'wapuaprof.json'),
      JSON.stringify(expectedConfig.wapuaprof));
    fs.writeFileSync(path.join(DIST_DIR, 'wappush-whitelist.json'),
      JSON.stringify(expectedConfig.wappush.whitelist));

    var testData = getTestData(expectedConfig);
    exec('GAIA_DISTRIBUTION_DIR=' + DIST_DIR + ' make applications-data',
    function(error, stdout, stderr) {
      helper.checkError(error, stdout, stderr);
      testData.forEach(function(data) {
        var actual = JSON.parse(fs.readFileSync(path.join.apply(null,
          data.path)));
        assert.deepEqual(actual, data.expected);
      })

      done();
    });
  });
});