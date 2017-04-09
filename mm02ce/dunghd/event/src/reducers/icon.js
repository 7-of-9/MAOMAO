import { ctxMenuLogin, ctxMenuLogout } from './helpers';

const initialState = {
  isEnable: false,
  isEnableIM: window.enableImscore,
  isEnableXp: window.enableXp,
  isYoutubeTest: window.enableTestYoutube,
  urls: [],
 };

export default (state = initialState, action, auth, nlp) => {
  switch (action.type) {
    case 'SWITCH_XP': {
      window.enableXp = action.payload.isEnableXp;
      ctxMenuLogin(auth.info, nlp.records);
      return Object.assign({}, state, action.payload);
    }

    case 'SWITCH_IM_SCORE':
    case 'YOUTUBE_TEST':
      ctxMenuLogin(auth.info, nlp.records);
      return Object.assign({}, state, action.payload);

    case 'RESET_SETTINGS':
      return Object.assign({}, state, action.payload);

    case 'MAOMAO_DISABLE': {
      chrome.contextMenus.removeAll();
      chrome.contextMenus.create({
        title: 'v0.5.9',
        contexts: ['browser_action'],
        id: 'mm-btn-version',
      });
      const url = action.payload.url;
      let urls = [];
      if (state.urls.length) {
        urls = state.urls.filter(item => item.url !== url);
      }
      if (auth.isLogin) {
        let isInternalTab = false;
        const startsWith = String.prototype.startsWith;
        if (
          startsWith.call(url, 'chrome://') ||
          startsWith.call(url, 'chrome-extension://')
        ) {
          isInternalTab = true;
        }
        urls = urls.concat({ url, color: 'black', text: isInternalTab ? '!(int)' : '' });
        window.setIconApp(
          action.payload.url,
          'black',
          isInternalTab ? '!(int)' : '',
          window.BG_ERROR_COLOR,
        );
      } else {
        urls = urls.concat({ url, color: 'gray', text: '' });
        window.setIconApp(
          action.payload.url,
          'gray',
          '',
          window.BG_SUCCESS_COLOR,
        );
      }
      return Object.assign({}, state, {
        isEnable: false,
        urls,
      });
    }

    case 'MAOMAO_ENABLE':
      {
        const url = action.payload.url;
        let urls = [];
        if (state.urls.length) {
          urls = state.urls.filter(item => item.url !== url);
        }
        if (auth.isLogin) {
          // TODO: Check share, xp is ready on url or not
          ctxMenuLogin(auth.info, nlp.records);
          const activeTabUrl = window.sessionObservable.icons.get(url);
          if (activeTabUrl) {
            if (activeTabUrl.image === 'gray') {
              window.setIconApp(
                url,
                'black',
                activeTabUrl.text,
                activeTabUrl.color,
              );
              urls = urls.concat({ url, color: 'black', text: activeTabUrl.text });
            } else {
              window.setIconApp(
                url,
                activeTabUrl.image,
                activeTabUrl.text,
                activeTabUrl.color,
              );
              urls = urls.concat({ url, color: activeTabUrl.image, text: activeTabUrl.text });
            }
          } else {
            window.setIconApp(url, 'black', '', window.BG_SUCCESS_COLOR);
            urls = urls.concat({ url, color: 'black', text: '' });
          }
        } else {
          ctxMenuLogout();
          window.setIconApp(
            action.payload.url,
            'gray',
            '',
            window.BG_SUCCESS_COLOR,
          );
          urls = urls.concat({ url, color: 'gray', text: '' });
        }
        return Object.assign({}, state, {
          isEnable: true,
          urls,
        });
      }

    default:
      return state;
  }
};
