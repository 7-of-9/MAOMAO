'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasInstalledExtension = hasInstalledExtension;
function hasInstalledExtension() {
  /* global chrome */
  return document.getElementById('maomao-extension-anchor') !== null || chrome.app.isInstalled;
}