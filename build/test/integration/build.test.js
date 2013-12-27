var exec = require('child_process').exec;
var assert = require('chai').assert;
var rmrf = require('rimraf').sync;
var download = require('download');
var async = require('async');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var AdmZip = require('adm-zip');

function getPrefsSandbox() {
  var sandbox = {
    prefs: {},
    userPrefs: {},

    user_pref: function(key, value) {
      sandbox.userPrefs[key] = value;
    },

    pref: function(key, value) {
      sandbox.prefs[key] = value;
    }
  };
  return sandbox;
}

function checkError(error, stdout, stderr) {
  if (error) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    console.log('error: ' + error);
  }
  assert.equal(error, null);
}

function checkCommonSettings(commonSettingsPath, settingsPath, ignoreSettings) {
  var settings = JSON.parse(fs.readFileSync(settingsPath));
  var commonSettings = JSON.parse(fs.readFileSync(commonSettingsPath));

  Object.keys(commonSettings).forEach(function(key) {
    if (ignoreSettings.indexOf(key) !== -1) {
      return;
    }
    assert.isDefined(settings[key]);
    assert.deepEqual(commonSettings[key], settings[key]);
  });
}

function checkPrefs(actual, expected) {
  Object.keys(expected).forEach(function(key) {
    assert.isDefined(actual[key]);
    assert.deepEqual(actual[key], expected[key]);
  });
}

function checkWebappsScheme(webapps) {
  Object.keys(webapps).forEach(function(key) {
    var webapp = webapps[key];
    var scheme =
      webapp.origin.indexOf('mochi.test') !== -1 ||
      webapp.origin.indexOf('marketplace.allizom.org') !== -1 ?
      'http' : 'app';
    assert.equal(webapp.origin.indexOf(scheme), 0);
  });
}

function checkFileInZip(zipPath, pathInZip, expectedPath) {
  var expected = fs.readFileSync(expectedPath);
  var zip = new AdmZip(zipPath);
  var actual = zip.readFile(zip.getEntry(pathInZip));
  assert.deepEqual(actual, expected);
}

suite('Build Integration tests', function() {
  var localesDir = 'tmplocales';

  suiteSetup(function() {
    rmrf('profile');
    rmrf('profile-debug');
    rmrf(localesDir);
  });

  test('make without rule & variable', function(done) {
    exec('make', function(error, stdout, stderr) {

      // expected values for prefs and user_prefs
      var expectedUserPrefs = {
        'browser.manifestURL': 'app://system.gaiamobile.org/manifest.webapp',
        'browser.homescreenURL': 'app://system.gaiamobile.org/index.html',
        'network.http.max-connections-per-server': 15,
        'dom.mozInputMethod.enabled': true,
        'ril.debugging.enabled': false,
        'dom.mms.version': 17,
        'b2g.wifi.allow_unsafe_wpa_eap': true
      };
      var expectedPrefs = {
        'geo.gps.supl_server': 'supl.izatcloud.net',
        'geo.gps.supl_port': 22024,
        'dom.payment.provider.0.name': 'firefoxmarket',
        'dom.payment.provider.0.description': 'marketplace.firefox.com',
        'dom.payment.provider.0.uri': 'https://marketplace.firefox.com/mozpay/?req=',
        'dom.payment.provider.0.type': 'mozilla/payments/pay/v1',
        'dom.payment.provider.0.requestMethod': 'GET',
        'dom.payment.skipHTTPSCheck': true,
        'dom.payment.provider.1.name': 'firefoxmarketdev',
        'dom.payment.provider.1.description': 'marketplace-dev.allizom.org',
        'dom.payment.provider.1.uri': 'https://marketplace-dev.allizom.org/mozpay/?req=',
        'dom.payment.provider.1.type': 'mozilla-dev/payments/pay/v1',
        'dom.payment.provider.1.requestMethod': 'GET',
        'dom.payment.provider.2.name': 'firefoxmarketstage',
        'dom.payment.provider.2.description': 'marketplace.allizom.org',
        'dom.payment.provider.2.uri': 'https://marketplace.allizom.org/mozpay/?req=',
        'dom.payment.provider.2.type': 'mozilla-stage/payments/pay/v1',
        'dom.payment.provider.2.requestMethod': 'GET'
      };

      // expected values for settings.json from build/data/common-settings.json
      var settingsPath = path.join(process.cwd(), 'profile', 'settings.json');
      var commonSettingsPath = path.join(process.cwd(), 'build', 'data',
        'common-settings.json');

      // we change these settings values in build/settings.js if
      // TARGET_BUILD_VARIANT is not 'user'
      var ignoreSettings = [
        'apz.force-enable',
        'debug.console.enabled',
        'developer.menu.enabled'
      ];

      // path in zip for unofficial branding
      var pathInZip = 'shared/resources/branding/initlogo.png';
      // zip path for system app
      var zipPath = path.join(process.cwd(), 'profile', 'webapps',
        'system.gaiamobile.org', 'application.zip');
      // expected branding file, it should be a unofficial branding if we
      // execute |make| without rule and variable.
      var expectedBrandingPath = path.join(process.cwd(),
        'shared', 'resources', 'branding', 'unofficial', 'initlogo.png');

      // Read user.js and use vm module to execute javascript in user.js
      var userjs = fs.readFileSync(
        path.join('profile', 'user.js'),
        { encoding: 'utf8' }
      );
      var sanbox = getPrefsSandbox();
      vm.runInNewContext(userjs, sanbox);

      var webapps = JSON.parse(fs.readFileSync(path.join(process.cwd(),
        'profile', 'webapps', 'webapps.json')));

      checkError(error, stdout, stderr);
      checkCommonSettings(commonSettingsPath, settingsPath, ignoreSettings);
      checkPrefs(sanbox.userPrefs, expectedUserPrefs);
      checkPrefs(sanbox.prefs, expectedPrefs);
      checkWebappsScheme(webapps);
      checkFileInZip(zipPath, pathInZip, expectedBrandingPath)

      done();
    });
  });

  test('make with PRODUCTION=1', function(done) {
    exec('PRODUCTION=1 make', function(error, stdout, stderr) {
      checkError(error, stdout, stderr);
      done();
    });
  });

  test('make with SIMULATOR=1', function(done) {
    exec('SIMULATOR=1 make', function(error, stdout, stderr) {
      checkError(error, stdout, stderr);
      done();
    });
  });

  test('make with DEBUG=1', function(done) {
    exec('DEBUG=1 make', function(error, stdout, stderr) {
      checkError(error, stdout, stderr);
      done();
    });
  });

  test('make with MOZILLA_OFFICIAL=1', function(done) {
    exec('MOZILLA_OFFICIAL=1 make', function(error, stdout, stderr) {
      checkError(error, stdout, stderr);
      done();
    });
  });

  test('make with GAIA_DISTRIBUTION_DIR=distribution_tablet', function(done) {
    exec('GAIA_DISTRIBUTION_DIR=distribution_tablet make',
      function(error, stdout, stderr) {
        checkError(error, stdout, stderr);
        done();
      }
    );
  });

  test('make with l10n configuration', function(done) {
    var locales = ['en-US', 'zh-CN'];
    var localesFileObj = {};
    var tasks = locales.map(function(locale) {
      localesFileObj[locale] = '';
      return function (callback) {
        var dir = path.join(localesDir, locale);
        fs.mkdirSync(dir);
        var url = 'http://hg.mozilla.org/gaia-l10n/' + locale +
          '/archive/tip.tar.gz';
        var dl = download(url, dir, {extract: true, strip: 1});
        dl.once('close', function() {
          callback();
        });
      };
    });

    tasks.push(function(callback) {
      localesFilePath = path.join(localesDir, 'languages.json');
      fs.writeFileSync(localesFilePath, JSON.stringify(localesFileObj));
      command = 'LOCALES_FILE=' + localesFilePath +
        ' LOCALE_BASEDIR=' + localesDir +
        ' make';
      exec(command, function(error, stdout, stderr) {
        checkError(error, stdout, stderr);
        callback();
      });
    });
    fs.mkdirSync(localesDir);
    async.series(tasks, function() {
      rmrf(localesDir);
      done();
    });
  });

  teardown(function() {
    rmrf('profile');
    rmrf('profile-debug');
  });
});
