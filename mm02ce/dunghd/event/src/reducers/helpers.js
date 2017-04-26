import md5 from 'blueimp-md5';

const isAllowToShare = (url, records) => {
  if (records && records.length) {
    const isExist = records.filter(item => item.url === url);
    return isExist.length > 0;
  }
  return false;
};

function createShareCtxMenu(records) {
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, (tabs) => {
    if (tabs != null && tabs.length > 0) {
      const url = tabs[0].url;
      if (isAllowToShare(url, records)) {
        chrome.contextMenus.create({ id: 'mm-btn-share', title: 'Share' });
      } else {
        chrome.contextMenus.create({ id: 'mm-btn-share-off', title: 'Share', enabled: false });
      }
    }
  });
}


function ctxMenu(records) {
  const parentId = chrome.contextMenus.create({ title: 'Debug' });
  chrome.contextMenus.create({ parentId, id: 'mm-btn-switch-youtube', title: 'Youtube Crawler', type: 'checkbox', checked: window.enableTestYoutube });
  chrome.contextMenus.create({ parentId, id: 'mm-btn-switch-imscore', title: 'Im Score', type: 'checkbox', checked: window.enableImscore });
  chrome.contextMenus.create({ parentId, id: 'mm-btn-reset-tld', title: 'Reset TLD XP timer' });
  createShareCtxMenu(records);
}

export function ctxMenuLogin(userInfo, records) {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.5.17',
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
  ctxMenu(records);
}

export function ctxMenuLogout() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.5.17',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
  });
  chrome.contextMenus.create({
    title: 'Login',
    contexts: ['browser_action'],
    id: 'mm-btn-login',
  });
  ctxMenu([]);
}

export function md5hash(userId) {
  const hash = md5(userId);
  const toUpperCase = String.prototype.toUpperCase;
  return toUpperCase.call(hash);
}
