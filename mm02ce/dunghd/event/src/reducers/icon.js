import moment from 'moment';
import { ctxMenuLogin, ctxMenuLogout } from './helpers';

const MIN_NSS = 10;

const initialState = {
  appId: '',
  isEnable: false,
  isEnableXP: false,
  isEnableXpInfo: false,
  isEnableIconText: false,
  isEnableIM: false,
  isYoutubeTest: false,
  isRealtime: false,
  urls: [],
  tldTimers: [],
  xpTimers: [],
};

const changeIconUrl = (urls, url, color, text) => {
  let result = [];
  if (urls.length) {
    result = urls.filter(item => item.url !== url);
  }
  return result.concat({ url, color, text });
};

const findScoreUrl = (nlp, url) => {
  let score = '';
  const hasExist = nlp.scores.find(item => item.url === url);
  if (hasExist) {
    score = hasExist.score;
  }
  return score;
};

const findTLD = (nlp, url) => {
  let tld = '';
  const hasExist = nlp.records.find(item => item.url === url);
  if (hasExist) {
    tld = hasExist.data && hasExist.data.tld_topic;
  }
  return tld;
};

export default (state = initialState, action, auth, nlp) => {
  switch (action.type) {
    case 'TIMER_XP': {
      // find TLD base on url
      const url = action.payload.url;
      let xpTimers = [];
      if (state.xpTimers.length) {
        xpTimers = state.xpTimers.filter(item => item.url !== url);
      }
      xpTimers = xpTimers.concat({
        url,
        timer: moment().add(1, 'hours').format(),
      });
      return Object.assign({}, state, { xpTimers });
    }
    case 'TIMER_TLD': {
      // find TLD base on url
      const url = action.payload.url;
      const tld = findTLD(nlp, url);
      if (!tld) {
        return state;
      }
      let tldTimers = [];
      if (state.tldTimers.length) {
        tldTimers = state.tldTimers.filter(item => item.tld !== tld);
      }
      tldTimers = tldTimers.concat({
        tld,
        timer: moment().add(1, 'hours').format(),
      });
      return Object.assign({}, state, { tldTimers });
    }
    case 'RESET_TIMER_TLD': {
      // find TLD base on url
      const url = action.payload.url;
      const tld = findTLD(nlp, url);
      if (!tld) {
        return state;
      }
      let tldTimers = [];
      let xpTimers = [];
      if (state.tldTimers.length) {
        tldTimers = state.tldTimers.filter(item => item.tld !== tld);
      }
      tldTimers = tldTimers.concat({
        tld,
        timer: moment().format(),
      });
      if (state.xpTimers.length) {
        xpTimers = state.xpTimers.filter(item => item.url !== url);
      }
      xpTimers = xpTimers.concat({
        url,
        timer: moment().format(),
      });
      return Object.assign({}, state, { tldTimers, xpTimers });
    }

    case 'SWITCH_IM_SCORE':
    case 'SWITCH_IM_XP_INFO':
    case 'SWITCH_ICON_TEXT':
    case 'SWITCH_XP':
    case 'SWITCH_REALTIME':
    case 'YOUTUBE_TEST':
      if (auth.isLogin) {
        ctxMenuLogin(auth.info, nlp.records);
      } else {
        ctxMenuLogout();
      }
      return Object.assign({}, state, action.payload);

    case 'RESET_SETTINGS':
      return Object.assign({}, state, action.payload);

    case 'MAOMAO_DISABLE': {
      chrome.contextMenus.removeAll();
      chrome.contextMenus.create({
        title: 'v0.6.0',
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
        }, { appId: window.BG_APP_UUID });
      }

    case 'LOGOUT_FULFILLED': {
      const url = window.sessionObservable.activeUrl;
      window.setIconApp(url, 'gray', '', window.BG_INACTIVE_COLOR);
      return Object.assign({}, initialState, { appId: window.BG_APP_UUID });
    }

    case 'AUTH_FULFILLED': {
      const url = window.sessionObservable.activeUrl;
      const urls = changeIconUrl(state.urls, url, 'black', '');
      window.setIconApp(url, 'black', '', window.BG_INACTIVE_COLOR);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'NLP_INFO_UNKNOWN': {
      const url = action.payload.url;
      const score = findScoreUrl(nlp, url);
      const urls = changeIconUrl(state.urls, url, 'black', `${score} *`);
      window.setIconApp(url, 'black', `${score} *`, window.BG_SUCCESS_COLOR);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'NNS_SCORE': {
      const url = action.payload.url;
      const score = action.payload.score;
      if (Number(action.payload.score) <= MIN_NSS) {
        const urls = changeIconUrl(state.urls, url, 'black', `!(${score})`);
        window.setIconApp(url, 'black', `!(${Number(score)})`, window.BG_ERROR_COLOR);
        return Object.assign({}, state, {
          urls,
        });
      }
      const urls = changeIconUrl(state.urls, url, 'black', `${score}`);
      window.setIconApp(url, 'black', `${Number(score)}`, window.BG_SUCCESS_COLOR);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'NLP_RESULT': {
      const url = action.payload.url;
      const score = findScoreUrl(nlp, url);
      const urls = changeIconUrl(state.urls, url, 'blue', `${score} **`);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'NLP_TERMS':
    case 'NLP_INFO_KNOWN': {
      const url = action.payload.url;
      const score = findScoreUrl(nlp, url);
      const urls = changeIconUrl(state.urls, url, 'blue', `${score}`);
      // set to blue2 for faster animation
      window.setIconApp(url, 'blue', `${score}`, window.BG_SUCCESS_COLOR);
      // call animation
      /* eslint-disable no-underscore-dangle */
      window.animationIcon(action._sender.tab.id, 10);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'IM_SAVE_SUCCESS': {
      const url = action.payload.url;
      const score = findScoreUrl(nlp, url);
      const urls = changeIconUrl(state.urls, url, 'blue', `${score} /`);
      window.setIconApp(url, 'blue', `${score} /`, window.BG_SUCCESS_COLOR);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'IM_SAVE_ERROR': {
      const url = action.payload.url;
      const urls = changeIconUrl(state.urls, url, 'blue', '*EX5');
      window.setIconApp(url, 'blue', '*EX5', window.BG_EXCEPTION_COLOR);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'TEXT_NOT_ENGLISH': {
      const url = action.payload.url;
      const score = findScoreUrl(nlp, url);
      const urls = changeIconUrl(state.urls, url, 'black', `${score} !EN`);
      window.setIconApp(url, 'black', `${score} !EN`, window.BG_SUCCESS_COLOR);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'PROCESS_TEXT_RESULT': {
      const url = action.payload.url;
      if (!action.payload.status) {
        const score = findScoreUrl(nlp, url);
        const urls = changeIconUrl(state.urls, url, 'black', `${score} !T`);
        window.setIconApp(url, 'black', `${score} !T`, window.BG_SUCCESS_COLOR);
        return Object.assign({}, state, {
          urls,
        });
      }

      return state;
    }

    case 'NLP_INFO_ERROR': {
      const url = action.payload.url;
      window.setIconApp(url, 'black', '*EX2', window.BG_EXCEPTION_COLOR);
      const urls = changeIconUrl(state.urls, url, 'black', '*EX2');
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'API_CALAIS_ERROR': {
      const url = action.payload.url;
      window.setIconApp(action.payload.url, 'black', '*EX3', window.BG_EXCEPTION_COLOR);
      const urls = changeIconUrl(state.urls, url, 'black', '*EX3');
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'NLP_CALAIS_ERROR': {
      const url = action.payload.url;
      window.setIconApp(action.payload.url, 'black', '*EX4', window.BG_EXCEPTION_COLOR);
      const urls = changeIconUrl(state.urls, url, 'black', '*EX4');
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'URL_RECORD_SUCCESS': {
      const url = action.payload.url;
      const score = findScoreUrl(nlp, url);
      const urls = changeIconUrl(state.urls, url, 'blue', `${score} **`);
      window.setIconApp(url, 'blue', `${score}`, window.BG_SUCCESS_COLOR);
      /* eslint-disable no-underscore-dangle */
      window.animationIcon(action._sender.tab.id, 5);
      return Object.assign({}, state, {
        urls,
      });
    }

    case 'URL_RECORD_ERROR': {
      const url = action.payload.url;
      window.setIconApp(action.payload.url, 'black', '*EX3.1', window.BG_EXCEPTION_COLOR);
      const urls = changeIconUrl(state.urls, url, 'black', '*EX3.1');
      return Object.assign({}, state, {
        urls,
      });
    }

    default:
      return state;
  }
};
