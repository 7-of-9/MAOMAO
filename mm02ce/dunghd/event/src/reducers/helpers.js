
export function ctxMenuLogin(userInfo, enableTestYoutube) {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.4.8',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
  });
  chrome.contextMenus.create({
    title: `Welcome back ${userInfo.name} (${userInfo.email})!`,
    contexts: ['browser_action'],
    id: 'mm-btn-show',
  });
  if (!enableTestYoutube) {
    chrome.contextMenus.create({
      title: 'Enable Test Youtube!',
      contexts: ['browser_action'],
      id: 'mm-btn-enable-youtube',
    });
  } else {
    chrome.contextMenus.create({
      title: 'Disable Test Youtube!',
      contexts: ['browser_action'],
      id: 'mm-btn-disable-youtube',
    });
  }
  chrome.contextMenus.create({
    title: 'Logout',
    contexts: ['browser_action'],
    id: 'mm-btn-logout',
  });
}

export function ctxMenuLogout() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'v0.4.8',
    contexts: ['browser_action'],
    id: 'mm-btn-version',
  });
  chrome.contextMenus.create({
    title: 'Login',
    contexts: ['browser_action'],
    id: 'mm-btn-login',
  });
}
