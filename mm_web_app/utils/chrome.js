export function hasInstalledExtension () {
  /* global chrome */
  return document.getElementById('maomao-extension-anchor') !== null || chrome.app.isInstalled
}
