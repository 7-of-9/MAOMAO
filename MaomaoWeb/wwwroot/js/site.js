function hasInstalledExtension() {
  return document.getElementById('maomao-extension-anchor') !== null || chrome.app.isInstalled;
}

function onInstallSucess() {
  // redirect to installed page
  window.location.href = 'http://maomaoweb.azurewebsites.net/Extension/Installed';
}

function onFail(err) {
  console.log(err);
}

function installExtension() {
  chrome.webstore.install(
    'https://chrome.google.com/webstore/detail/gennpkeookgnpcionphekmlgdgikklag',
    onInstallSucess,
    onFail);
}
