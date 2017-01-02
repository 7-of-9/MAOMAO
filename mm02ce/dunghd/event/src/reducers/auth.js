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
    title: 'Show UI',
    contexts: ['browser_action'],
    id: 'mm-btn-show',
  });
  chrome.contextMenus.create({
    title: `Welcome back ${userInfo.name} (${userInfo.email})!`,
    contexts: ['browser_action'],
    id: 'mm-btn-welcome-back',
  });
  chrome.contextMenus.create({
    title: 'Logout',
    contexts: ['browser_action'],
    id: 'mm-btn-logout',
  });
}

function ctxMenuLogout() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    title: 'Show UI',
    contexts: ['browser_action'],
    id: 'mm-btn-show',
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
    default:
      return state;
  }
};
