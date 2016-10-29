function hasInstalledExtension() {
  return document.getElementById('maomao-extension-anchor') !== null || chrome.app.isInstalled;
}

function onInstallSucess() {
  // redirect to installed page
  window.location.href = 'http://maomaoweb.azurewebsites.net/Extension/Installed';
}

function onFail(err) {
  console.log(err);
  // Error: Inline installs can only be initiated for Chrome Web Store items that have one or more verified sites.
  window.location.href = 'https://chrome.google.com/webstore/detail/mm02ce/onkinoggpeamajngpakinabahkomjcmk';
}

function installExtension() {
  chrome.webstore.install(
    'https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk',
    onInstallSucess,
    onFail);
}
