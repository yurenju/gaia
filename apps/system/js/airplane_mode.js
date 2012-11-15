/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var AirplaneMode = {
  enabled: false,

  init: function apm_init() {
    if (!window.navigator.mozSettings)
      return;

    var mobileDataEnabled = false;


    var bluetooth = window.navigator.mozBluetooth;
    var wifiManager = window.navigator.mozWifiManager;
    var mobileData = window.navigator.mozMobileConnection &&
      window.navigator.mozMobileConnection.data;

    var restoreMobileData = false;
    var restoreBluetooth = false;
    var restoreWifi = false;
    var restoreGeolocation = false;
    // Note that we don't restore Wifi tethering when leaving airplane mode
    // because Wifi tethering can't be switched on before data connection is established.

    var self = this;
  }
};

AirplaneMode.init();
