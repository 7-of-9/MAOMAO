import md5 from 'blueimp-md5';

const isAllowToShare = (url, records) => {
  if (records && records.length) {
    const isExist = records.filter(item => item.url === url);
    return isExist.length > 0;
  }
  return false;
};

function createShareCtxMenu(records) {
  if (records.length > 0) {
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      if (tabs != null && tabs.length > 0) {
        const url = tabs[0].url;
        if (isAllowToShare(url, records)) {
          chrome.contextMenus.create({ contexts: ['page_action', 'page'], id: 'mm-btn-share', title: ' maomao share' });
        }
      }
    });
  }
}


function ctxMenu() {
  const parentId = chrome.contextMenus.create({ contexts: ['browser_action'], id: 'mm-btn-dev-menu', title: 'Dev menu' });
  chrome.contextMenus.create({ parentId, contexts: ['browser_action'], id: 'mm-btn-switch-youtube', title: 'Youtube Crawler', type: 'checkbox', checked: window.enableTestYoutube });
  chrome.contextMenus.create({ parentId, contexts: ['browser_action'], type: 'separator' });
  chrome.contextMenus.create({ parentId, contexts: ['browser_action'], id: 'mm-btn-switch-imscore', title: 'IM Score', type: 'checkbox', checked: window.enableImscore });
  chrome.contextMenus.create({ parentId, contexts: ['browser_action'], id: 'mm-btn-switch-icon-text', title: 'Browser icon tooltip', type: 'checkbox', checked: window.enableIconText });
  chrome.contextMenus.create({ parentId, contexts: ['browser_action'], type: 'separator' });
  chrome.contextMenus.create({ parentId, contexts: ['browser_action'], id: 'mm-btn-switch-xp', title: 'XP', type: 'checkbox', checked: window.enableXP });
  chrome.contextMenus.create({ parentId, contexts: ['browser_action'], id: 'mm-btn-reset-tld', title: 'Reset TLD timer' });
}

export function ctxMenuLogin(userInfo, records) {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.5.35',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
    enabled: false,
  });
  chrome.contextMenus.create({ contexts: ['browser_action'], type: 'separator' });
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
  chrome.contextMenus.create({ contexts: ['browser_action'], type: 'separator' });
  ctxMenu();
  createShareCtxMenu(records);
}

export function ctxMenuLogout() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.5.35',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
    enabled: false,
  });
  chrome.contextMenus.create({ contexts: ['browser_action'], type: 'separator' });
  chrome.contextMenus.create({
    title: 'Login',
    contexts: ['browser_action'],
    id: 'mm-btn-login',
  });
  chrome.contextMenus.create({ contexts: ['browser_action'], type: 'separator' });
  ctxMenu();
}

export function md5hash(userId) {
  const hash = md5(userId);
  const toUpperCase = String.prototype.toUpperCase;
  return toUpperCase.call(hash);
}
