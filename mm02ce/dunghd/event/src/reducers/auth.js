import { ctxMenuLogin, ctxMenuLogout, md5hash } from './helpers';

const initialState = {
  isLogin: false,
  message: '',
  googleToken: '',
  facebookToken: '',
  isPending: false,
  isFetchContacts: false,
  info: {},
  userId: -1,
  userHash: '',
  googleUserId: '',
  facebookUserId: '',
  contacts: [],
  accounts: [],
};

export default (state = initialState, action, nlp) => {
  switch (action.type) {
    case 'ACCOUNT_CONNECT': {
      return Object.assign({}, state, action.payload);
    }
    case 'DOWNLOAD_PHOTO_DONE': {
      const contacts = [];
      state.contacts.forEach((contact) => {
        contacts.push(action.payload.photos.find(item => item.email === contact.email));
      });
      return Object.assign({}, state, { contacts });
    }
    case 'AUTO_LOGIN': {
      window.userId = state.userId;
      if (state.userId !== -1) {
        window.isGuest = false;
        window.userHash = md5hash(state.googleUserId || state.facebookUserId);
        ctxMenuLogin(state.info, nlp.records);
      }
      return state;
    }
    case 'AUTH_PENDING':
      return Object.assign({}, state, { isPending: true });
    case 'FETCH_CONTACTS_PENDING':
      return Object.assign({}, state, { isFetchContacts: true });
    case 'GOOGLE_CONTACTS_FULFILLED':
      return Object.assign({}, state, {
        googleToken: action.payload.googleToken || state.googleToken,
        googleUserId: action.payload.googleUserId || state.googleUserId,
      });
    case 'AUTH_FULFILLED':
      ctxMenuLogin(action.payload.info, nlp.records);
      return Object.assign({}, state, {
        message: 'authentication is done',
        googleToken: action.payload.googleToken || state.googleToken,
        facebookToken: action.payload.facebookToken || state.facebookToken,
        info: action.payload.info,
        googleUserId: action.payload.googleUserId || state.googleUserId,
        facebookUserId: action.payload.facebookUserId || state.facebookUserId,
        isPending: false,
        isLogin: true,
      });
    case 'USER_AFTER_LOGIN':
      window.after_login(action.payload.userId);
      return Object.assign({}, state, action.payload);
    case 'USER_HASH':
      window.userHash = md5hash(action.payload.userHash);
      return Object.assign({}, state, { userHash: window.userHash });
    case 'USER_AFTER_LOGOUT':
      window.after_logout();
      return Object.assign({}, state, { isLogin: false, contacts: [], userId: -1, userHash: '', googleUserId: '', facebookUserId: '' });
    case 'FETCH_CONTACTS_FULFILLED':
      return Object.assign({}, state, { contacts: action.payload.data, isFetchContacts: false });
    case 'AUTH_REJECTED':
      // force to logout out on bg
      window.userId = -1;
      window.isGuest = true;
      return Object.assign({}, state, {
        message: action.payload.error.message,
        googleToken: '',
        googleUserId: '',
        facebookToken: '',
        facebookUserId: '',
        contacts: [],
        info: {},
        userHash: '',
        userId: -1,
        isPending: false,
        isLogin: false,
      });
    case 'FETCH_CONTACTS_REJECTED':
      return Object.assign({}, state, {
        message: action.payload.error.message,
        isFetchContacts: false,
      });
    case 'GOOGLE_CONTACTS_REJECTED':
      return Object.assign({}, state, {
        message: action.payload.error.message,
      });
    case 'LOGOUT_FULFILLED':
      ctxMenuLogout();
      // TODO: clear all sessions on bg and tracking tab
      window.sessionObservable.icons.clear();
      window.sessionObservable.urls.clear();
      window.mm_load();
      return Object.assign({}, initialState);
    case 'LOGOUT_REJECTED':
      return Object.assign({}, state, {
        message: action.payload.error.message,
        isPending: false,
      });
    default:
      return state;
  }
};
