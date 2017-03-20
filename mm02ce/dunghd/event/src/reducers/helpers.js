import md5 from 'blueimp-md5';

function ctxMenu() {
  chrome.contextMenus.create({ id: 'mm-btn-switch-youtube', title: 'Youtube', type: 'checkbox', checked: window.enableTestYoutube });
  chrome.contextMenus.create({ id: 'mm-btn-switch-imscore', title: 'Im Score', type: 'checkbox', checked: window.enableImscore });
  chrome.contextMenus.create({ id: 'mm-btn-share', title: 'Share' });
}

export function ctxMenuLogin(userInfo) {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.4.14',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
  });
  chrome.contextMenus.create({
    title: `Welcome, ${userInfo.name} (${userInfo.email})!`,
    contexts: ['browser_action'],
    id: 'mm-btn-show',
  });
  chrome.contextMenus.create({
    title: 'Logout',
    contexts: ['browser_action'],
    id: 'mm-btn-logout',
  });
  ctxMenu();
}

export function ctxMenuLogout() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.4.14',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
  });
  chrome.contextMenus.create({
    title: 'Login',
    contexts: ['browser_action'],
    id: 'mm-btn-login',
  });
  ctxMenu();
}

export function md5hash(userId) {
  const hash = md5(userId);
  const toUpperCase = String.prototype.toUpperCase;
  return toUpperCase.call(hash);
}
