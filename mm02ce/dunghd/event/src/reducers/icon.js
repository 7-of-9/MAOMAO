import { ctxMenuLogin, ctxMenuLogout } from './helpers';

const initialState = {
    isEnable: false,
    isYoutubeTest: false,
};

export default (state = initialState, action, auth) => {
    switch (action.type) {
        case 'YOUTUBE_TEST':
            ctxMenuLogin(auth.info, window.enableTestYoutube);
            return Object.assign({}, state, { isYoutubeTest: window.enableTestYoutube });
        case 'MAOMAO_DISABLE':
            chrome.contextMenus.removeAll();
            chrome.contextMenus.create({
                title: 'v0.4.8',
                contexts: ['browser_action'],
                id: 'mm-btn-version',
            });
            if (auth.isLogin) {
                let isInternalTab = false;
                const url = action.payload.url;
                const startsWith = String.prototype.startsWith;
                if (startsWith.call(url, 'chrome://') || startsWith.call(url, 'chrome-extension://')) {
                    isInternalTab = true;
                }
                window.setIconApp(action.payload.url, 'black', isInternalTab ? '!(int)' : '', window.BG_ERROR_COLOR);
            } else {
                window.setIconApp(action.payload.url, 'gray', '', window.BG_SUCCESS_COLOR);
            }
            return Object.assign({}, state, { isEnable: false });
        case 'MAOMAO_ENABLE': {
            if (auth.isLogin) {
                ctxMenuLogin(auth.info, window.enableTestYoutube);
                const url = action.payload.url;
                const activeTabUrl = window.sessionObservable.icons.get(url);
                if (activeTabUrl) {
                    if (activeTabUrl.image === 'gray') {
                        window.setIconApp(url, 'black', activeTabUrl.text, activeTabUrl.color);
                    } else {
                        window.setIconApp(url, activeTabUrl.image, activeTabUrl.text, activeTabUrl.color);
                    }
                } else {
                    window.setIconApp(url, 'black', '', window.BG_SUCCESS_COLOR);
                }
            } else {
                ctxMenuLogout();
                window.setIconApp(action.payload.url, 'gray', '', window.BG_SUCCESS_COLOR);
            }
            return Object.assign({}, state, { isEnable: true });
        }
        default:
            return state;
    }
};
