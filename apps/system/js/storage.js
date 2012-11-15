var Storage = {

  automounterDisable: 0,
  automounterEnable: 1,
  automounterDisableWhenUnplugged: 2,

  umsEnabled: 'ums.enabled',
  umsMode: 'ums.mode',

  init: function storageInit() {
    this.setMode(this.automounterDisable, 'init');
    window.addEventListener('lock', this);
    window.addEventListener('unlock', this);


  },

  modeFromBool: function storageModeFromBool(val) {
     return val ? this.automounterEnable : this.automounterDisable;
  },

  setMode: function storageSetMode(val, reason) {
    if (!window.navigator.mozSettings)
      return;

    //console.info('Setting', this.umsMode, 'to', val, 'due to', reason);
    var param = {};
    param[this.umsMode] = val;

  },

  handleEvent: function storageHandleEvent(e) {
    switch (e.type) {
      case 'lock':
        this.setMode(this.automounterDisableWhenUnplugged, 'screen locked');
        break;
      case 'unlock':
        if (!window.navigator.mozSettings)
          return;


        break;
      default:
        return;
    }
  }
};

Storage.init();
