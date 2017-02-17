export function ctxMenuLogin(userInfo, enableTestYoutube, enableImscore) {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: 'v0.4.11',
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
            title: 'Enable Test Youtube',
            contexts: ['browser_action'],
            id: 'mm-btn-switch-youtube',
        });
    } else {
        chrome.contextMenus.create({
            title: 'Disable Test Youtube',
            contexts: ['browser_action'],
            id: 'mm-btn-switch-youtube',
        });
    }

    if (enableImscore) {
        chrome.contextMenus.create({
            title: 'Turn off IM_SCORE',
            contexts: ['browser_action'],
            id: 'mm-btn-switch-imscore',
        });
    } else {
        chrome.contextMenus.create({
            title: 'Turn on IM_SCORE',
            contexts: ['browser_action'],
            id: 'mm-btn-switch-imscore',
        });
    }
    chrome.contextMenus.create({
        title: 'Test XP Popup',
        contexts: ['browser_action'],
        id: 'mm-btn-xp-popup',
    });
    chrome.contextMenus.create({
        title: 'Scale XP Popup Up (+0.5)',
        contexts: ['browser_action'],
        id: 'mm-btn-xp-scale-up-popup',
    });
    chrome.contextMenus.create({
        title: 'Scale XP Popup Down (-0.5)',
        contexts: ['browser_action'],
        id: 'mm-btn-xp-scale-down-popup',
    });
    chrome.contextMenus.create({
        title: 'Logout',
        contexts: ['browser_action'],
        id: 'mm-btn-logout',
    });
}

export function ctxMenuLogout() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: 'v0.4.11',
        contexts: ['browser_action'],
        id: 'mm-btn-version',
    });
    chrome.contextMenus.create({
        title: 'Login',
        contexts: ['browser_action'],
        id: 'mm-btn-login',
    });
    chrome.contextMenus.create({
        title: 'Test XP Popup',
        contexts: ['browser_action'],
        id: 'mm-btn-xp-popup',
    });
    chrome.contextMenus.create({
        title: 'Scale XP Popup Up (+0.5)',
        contexts: ['browser_action'],
        id: 'mm-btn-xp-scale-up-popup',
    });
    chrome.contextMenus.create({
        title: 'Scale XP Popup Down (-0.5)',
        contexts: ['browser_action'],
        id: 'mm-btn-xp-scale-down-popup',
    });
}