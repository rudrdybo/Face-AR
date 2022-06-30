const {Controller} = require('./controller');
const {UI} = require('../ui/ui');

const e = {
  Controller, 
  UI
}

if (!window.dybo) {
  window.dybo = {};
}

window.dybo.FACE = e;

module.exports = e;
