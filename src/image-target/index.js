const {Controller} = require('./controller');
const {Compiler} = require('./compiler');
const {UI} = require('../ui/ui');

const e = {
  Controller, 
  Compiler,
  UI
}

if (!window.dybo) {
  window.dybo = {};
}

window.dybo.IMAGE = e;

module.exports = e;
