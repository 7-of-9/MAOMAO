// read data from local storage for checking user has login or not
import { ctxMenuLogin, ctxMenuLogout, md5hash } from './helpers';

const initialState = {
  isLogin: false,
  message: '',
  accessToken: '',
  isPending: false,
  isFetchContacts: false,
  info: {},
  userId: -1,
  userHash: '',
  googleUserId: '',
  facebookUserId: '',
  contacts: [],
};

export default (state = initialState, action, nlp) => {
  switch (action.type) {
    case 'AUTH_PENDING':
      return Object.assign({}, state, { isPending: true });
    case 'FETCH_CONTACTS_PENDING':
      return Object.assign({}, state, { isFetchContacts: true });
    case 'AUTH_FULFILLED':
      ctxMenuLogin(action.payload.info, nlp.records);
      window.setIconApp(window.sessionObservable.activeUrl, 'black', '', window.BG_INACTIVE_COLOR);
      return Object.assign({}, state, {
        message: 'authentication is done',
        accessToken: action.payload.token,
        info: action.payload.info,
        googleUserId: action.payload.googleUserId || '',
        facebookUserId: action.payload.facebookUserId || '',
        isPending: false,
        isLogin: true,
      });
    case 'USER_AFTER_LOGIN':
      return Object.assign({}, state, action.payload);
    case 'USER_HASH':
      window.userHash = md5hash(action.payload.userHash);
      return Object.assign({}, state, { userHash: window.userHash });
    case 'USER_AFTER_LOGOUT':
      return Object.assign({}, state, { contacts: [], userId: -1, userHash: '', googleUserId: '', facebookUserId: '' });
    case 'FETCH_CONTACTS_FULFILLED':
      return Object.assign({}, state, { contacts: action.payload.data, isFetchContacts: false });
    case 'AUTH_REJECTED':
      return Object.assign({}, state, {
        message: action.payload.error.message,
        accessToken: '',
        info: {},
        isPending: false,
        isLogin: false,
      });
    case 'FETCH_CONTACTS_REJECTED':
      return Object.assign({}, state, {
         message: action.payload.error.message,
          isFetchContacts: false,
         });
    case 'LOGOUT_FULFILLED':
      ctxMenuLogout();
      // TODO: clear all sessions on bg and tracking tab
      window.setIconApp('', 'gray', '', window.BG_INACTIVE_COLOR);
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
