/* global chrome */

export function hasInstalledExtension() {
  return document.getElementById('maomao-extension-anchor') !== null || chrome.app.isInstalled;
}
