import { ctxMenuLogin, ctxMenuLogout } from './helpers';

const initialState = {
  isEnable: false,
  isYoutubeTest: false,
  isEnableIM: true,
  isReadyShare: true,
  isEnableXp: true,
 };

const isAllowToShare = (url, records) => {
 if (records && records.length) {
   const isExist = records.filter(item => item.url === url);
   return isExist.length > 0;
 }

 return false;
};

export default (state = initialState, action, auth, nlp) => {
  switch (action.type) {
    case 'SWITCH_IM_SCORE':
    case 'SWITCH_XP':
    case 'YOUTUBE_TEST':
      ctxMenuLogin(auth.info, nlp.records);
      return Object.assign({}, state, action.payload);

    case 'MAOMAO_DISABLE': {
      chrome.contextMenus.removeAll();
      chrome.contextMenus.create({
        title: 'v0.5.4',
        contexts: ['browser_action'],
        id: 'mm-btn-version',
      });
      const url = action.payload.url;
      if (auth.isLogin) {
        let isInternalTab = false;
        const startsWith = String.prototype.startsWith;
        if (
          startsWith.call(url, 'chrome://') ||
          startsWith.call(url, 'chrome-extension://')
        ) {
          isInternalTab = true;
        }

        window.setIconApp(
          action.payload.url,
          'black',
          isInternalTab ? '!(int)' : '',
          window.BG_ERROR_COLOR,
        );
      } else {
        window.setIconApp(
          action.payload.url,
          'gray',
          '',
          window.BG_SUCCESS_COLOR,
        );
      }
      return Object.assign({}, state, {
        isEnable: false,
        isEnableXp: isAllowToShare(url, nlp.records),
        isReadyShare: isAllowToShare(url, nlp.records),
      });
    }

    case 'MAOMAO_ENABLE':
      {
        const url = action.payload.url;
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
            } else {
              window.setIconApp(
                url,
                activeTabUrl.image,
                activeTabUrl.text,
                activeTabUrl.color,
              );
            }
          } else {
            window.setIconApp(url, 'black', '', window.BG_SUCCESS_COLOR);
          }
        } else {
          ctxMenuLogout();
          window.setIconApp(
            action.payload.url,
            'gray',
            '',
            window.BG_SUCCESS_COLOR,
          );
        }
        return Object.assign({}, state, {
          isEnable: true,
          isReadyShare: isAllowToShare(url, nlp.records),
        });
      }

    default:
      return state;
  }
};
