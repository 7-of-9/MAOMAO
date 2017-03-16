import md5 from 'blueimp-md5';

export function md5hash(userId) {
  const hash = md5(userId);
  const toUpperCase = String.prototype.toUpperCase;
  return toUpperCase.call(hash);
}

function debugCtxMenu() {
  chrome.contextMenus.create({ id: 'mm-btn-switch-youtube', title: 'Youtube', type: 'checkbox', checked: window.enableTestYoutube });
  chrome.contextMenus.create({ id: 'mm-btn-switch-imscore', title: 'Im Score', type: 'checkbox', checked: window.enableImscore });
  // const parent = chrome.contextMenus.create({ title: 'XP Popup' });
  // chrome.contextMenus.create({ id: 'mm-btn-xp-popup', title: 'Test', parentId: parent });
  // chrome.contextMenus.create({ id: 'mm-btn-xp-scale-up-popup', title: 'Scale Up', parentId: parent });
  // chrome.contextMenus.create({ id: 'mm-btn-xp-scale-down-popup', title: 'Scale Down', parentId: parent });
}

export function ctxMenuLogin(userInfo) {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.4.13',
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
  debugCtxMenu();
}

export function ctxMenuLogout() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.4.13',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
  });
  chrome.contextMenus.create({
    title: 'Login',
    contexts: ['browser_action'],
    id: 'mm-btn-login',
  });
  debugCtxMenu();
}
