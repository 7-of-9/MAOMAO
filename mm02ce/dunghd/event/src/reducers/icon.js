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
            if (auth.isLogin) {
                let isInternalTab = false;
                const url = action.payload.url;
                const startsWith = String.prototype.startsWith;
                if (startsWith.call(url, 'chrome://') || startsWith.call(url, 'chrome-extension://')) {
                    isInternalTab = true;
                }
                window.setIconApp('black', isInternalTab ? '!(int)' : '', window.BG_ERROR_COLOR);
            } else {
                window.setIconApp('gray', '', window.BG_SUCCESS_COLOR);
            }
            return Object.assign({}, state, { isEnable: false });
        case 'MAOMAO_ENABLE': {
            if (auth.isLogin) {
                ctxMenuLogin(auth.info);
                const url = action.payload.url;
                const activeTabUrl = window.sessionObservable.icons.get(url);
                if (activeTabUrl) {
                    window.setIconApp(activeTabUrl.image, activeTabUrl.text, activeTabUrl.color);
                }
            } else {
                ctxMenuLogout();
                window.setIconApp('gray', '', window.BG_SUCCESS_COLOR);
            }
            return Object.assign({}, state, { isEnable: true });
        }
        default:
            return state;
    }
};
