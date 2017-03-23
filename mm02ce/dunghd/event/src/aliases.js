import axios from 'axios';
import firebase from 'firebase';
import { checkGoogleAuth, fetchContacts } from './social/google';
import checkFacebookAuth from './social/facebook';

function actionCreator(type, payload) {
  return {
    type,
    payload,
  };
}

function logout(token) {
  const promise = new Promise((resolve, reject) => {
    // revoke token
    axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
      .then(response => console.log('revoke', response))
      .catch(error => console.log('revoke error', error));
    // logout firebase
    if (firebase.auth().currentUser) {
      console.log('firebase logout');
      firebase.auth().signOut();
    }

    // NOTE: set value for bg_session.js
    window.isGuest = true;
    window.userId = -1;
    window.userHash = '';
    window.enableTestYoutube = false;

    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        // validate token
        resolve({ token: '', info: {} });
      }
    });
  });
  return promise;
}

const authLogout = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending) {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return logout(auth.accessToken)
        .then((data) => {
          dispatch(actionCreator('LOGOUT_FULFILLED', { token: data.token, info: data.info }));
          dispatch(actionCreator('USER_AFTER_LOGOUT'));
        }).catch(error => dispatch(actionCreator('LOGOUT_REJECTED', error)));
    }
    return dispatch(
      actionCreator('LOGOUT_FULFILLED', { token: '', info: {} }),
    );
  }
);

const authGoogleLogin = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending || auth.accessToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return checkGoogleAuth()
        .then((data) => {
          dispatch(actionCreator('USER_HASH', { userHash: data.googleUserId }));
          dispatch(actionCreator('AUTH_FULFILLED', data));
        }).catch((error) => {
          // Try to logout and remove cache token
          if (firebase.auth().currentUser) {
            firebase.auth().signOut();
          }
          dispatch(actionCreator('AUTH_REJECTED', { error }));
        });
    }
    dispatch(actionCreator('USER_HASH', { userHash: auth.googleUserId }));
    return dispatch(
      actionCreator('AUTH_FULFILLED', { googleUserId: auth.googleUserId, token: auth.accessToken, info: auth.info }),
    );
  }
);

const authFacebookLogin = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending || auth.accessToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return checkFacebookAuth()
        .then((data) => {
          dispatch(actionCreator('USER_HASH', { userHash: data.facebookUserId }));
          dispatch(actionCreator('AUTH_FULFILLED', data));
        }).catch((error) => {
          // Try to logout and remove cache token
          if (firebase.auth().currentUser) {
            firebase.auth().signOut();
          }
          dispatch(actionCreator('AUTH_REJECTED', { error }));
        });
    }
    dispatch(actionCreator('USER_HASH', { userHash: auth.facebookUserId }));
    return dispatch(
      actionCreator('AUTH_FULFILLED', { facebookUserId: auth.facebookUserId, token: auth.accessToken, info: auth.info }),
    );
  }
);


const getContacts = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    dispatch({
      type: 'FETCH_CONTACTS_PENDING',
    });
    return fetchContacts(auth.accessToken, 1, 1000)
      .then(data => dispatch(
        actionCreator('FETCH_CONTACTS_FULFILLED', data)),
    ).catch((error) => {
      dispatch(actionCreator('FETCH_CONTACTS_REJECTED', { error }));
    });
  }
);

export default {
  AUTH_LOGIN_GOOGLE: authGoogleLogin,
  AUTH_LOGIN_FACEBOOK: authFacebookLogin,
  AUTH_LOGOUT: authLogout,
  FETCH_CONTACTS: getContacts,
};
