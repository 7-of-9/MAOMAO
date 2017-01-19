// read data from local storage for checking user has login or not

const initialState = {
  isLogin: false,
  message: '',
  accessToken: '',
  isPending: false,
  info: {},
};

function ctxMenuLogin(userInfo) {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: `Welcome back ${userInfo.name} (${userInfo.email})!`,
    contexts: ['browser_action'],
    id: 'mm-btn-show',
  });
  if (!window.enableTestYoutube) {
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

function ctxMenuLogout() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'Login',
    contexts: ['browser_action'],
    id: 'mm-btn-login',
  });
}


export default (state = initialState, action) => {
  switch (action.type) {
    case 'AUTH_PENDING':
      return Object.assign({}, state, { isPending: true });
    case 'AUTH_FULFILLED':
      ctxMenuLogin(action.payload.info);
      return Object.assign({}, state, {
        message: 'authentication is done',
        accessToken: action.payload.token,
        info: action.payload.info,
        isPending: false,
        isLogin: true,
      });
    case 'AUTH_REJECTED':
      return Object.assign({}, state, {
        message: action.payload.error.message,
        accessToken: '',
        info: {},
        isPending: false,
        isLogin: false,
      });
    case 'LOGOUT_FULFILLED':
      ctxMenuLogout();
      return Object.assign({}, state, {
        message: 'user has been logout',
        accessToken: action.payload.token,
        info: action.payload.info,
        isPending: false,
        isLogin: false,
      });
    case 'LOGOUT_REJECTED':
      return Object.assign({}, state, {
        message: action.payload.error.message,
        isPending: false,
      });
    case 'USER_AFTER_LOGIN':
      // call bg function
      window.setIconEnabledLive();
      return state;
    case 'YOUTUBE_TEST':
      // call bg function
      ctxMenuLogin(state.info);
      return state;
    case 'MAOMAO_DISABLE':
      chrome.contextMenus.removeAll();
      window.setIconForDisable();
      return state;
    case 'MAOMAO_ENABLE':
      if (state.isLogin) {
        ctxMenuLogin(state.info);
      } else {
        ctxMenuLogout();
        window.setIconText('Login!', '#ff0000');
      }
      return state;
    default:
      return state;
  }
};
