import axios from 'axios';
import firebase from 'firebase';
import { batchActions } from 'redux-batched-actions';
import { checkGoogleAuth, fetchContacts } from './social/google';
import checkFacebookAuth from './social/facebook';
import { actionCreator, notifyMsg } from './utils';

const throttledQueue = require('throttled-queue');

const throttle = throttledQueue(10, 1000); // at most make 10 request every second.

function logout(auth) {
  console.warn('logout', auth);
  const promise = new Promise((resolve, reject) => {
    // revoke token
    if (auth.googleUserId && auth.googleToken) {
      // revoke token for google
      axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${auth.googleToken}`)
        .then(response => console.log('revoke', response))
        .catch(error => console.log('revoke error', error));
    }

    if (auth.facebookUserId && auth.facebookToken) {
      // revoke token for fb
      axios.delete(`https://graph.facebook.com/${auth.facebookUserId}/permissions?access_token=${auth.facebookToken}`)
        .then(response => console.log('revoke', response))
        .catch(error => console.log('revoke error', error));
    }

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
    window.enableXp = false;
    if (auth.googleUserId && auth.googleToken) {
      chrome.identity.removeCachedAuthToken({ token: auth.googleToken }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          // validate token
          resolve({ token: '', info: {} });
        }
      });
    } else {
      resolve({ token: '', info: {} });
    }
  });
  return promise;
}

function base64ImageFromUrl(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onload = (ev) => {
    if (ev.target && ev.target.status === 200) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(null, reader.result);
      };
      reader.readAsDataURL(xhr.response);
    } else {
      callback(new Error(`Not found image, error code ${ev.target.status}`));
    }
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

function downloadPhoto(dispatch, contacts) {
  contacts.forEach((contact) => {
    if (contact.image && contact.image.indexOf('http') !== -1) {
      throttle(() => {
        base64ImageFromUrl(contact.image, (err, base64Image) => {
          if (err) {
            dispatch(actionCreator('PHOTO_NO_IMAGE', {
              ...contact,
              image: '',
            }));
          } else {
            dispatch(actionCreator('PHOTO_IMAGE', {
              ...contact,
              image: base64Image,
            }));
          }
        });
      });
    }
  });
}

const authLogout = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending) {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return logout(auth)
        .then((data) => {
          dispatch(batchActions([
            actionCreator('LOGOUT_FULFILLED', { token: data.token, info: data.info }),
            actionCreator('USER_AFTER_LOGOUT'),
          ]));
        }).catch(error => dispatch(actionCreator('LOGOUT_REJECTED', error)));
    }
    return dispatch(
      actionCreator('LOGOUT_FULFILLED', { token: '', info: {} }),
    );
  }
);

const authGoogleLogin = data => (
  (dispatch, getState) => {
    const { isLinked } = data.payload;
    const { auth } = getState();
    if (!auth.isPending || auth.googleToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      console.warn('isLinked', isLinked, data.payload);
      return checkGoogleAuth(isLinked)
        .then((result) => {
          dispatch(actionCreator('AUTH_FULFILLED', result));
          if (!isLinked) {
            dispatch(actionCreator('USER_HASH', { userHash: result.googleUserId }));
          }
        }).catch((error) => {
          // Try to logout and remove cache token
          if (firebase.auth().currentUser) {
            firebase.auth().signOut();
          }
          dispatch(actionCreator('AUTH_REJECTED', { error }));
        });
    }

    return dispatch(batchActions([
        actionCreator('AUTH_FULFILLED', { googleUserId: auth.googleUserId, googleToken: auth.googleToken, info: auth.info }),
        actionCreator('USER_HASH', { userHash: auth.googleUserId }),
      ]));
  }
);

const authFacebookLogin = data => (
  (dispatch, getState) => {
    const { isLinked } = data.payload;
    const { auth } = getState();
    if (!auth.isPending || auth.facebookToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      console.warn('isLinked', isLinked, data.payload);
      return checkFacebookAuth(isLinked)
        .then((result) => {
          dispatch(actionCreator('AUTH_FULFILLED', result));
          if (!isLinked) {
            dispatch(actionCreator('USER_HASH', { userHash: result.facebookUserId }));
          }
        }).catch((error) => {
          // Try to logout and remove cache token
          if (firebase.auth().currentUser) {
            firebase.auth().signOut();
          }
          dispatch(actionCreator('AUTH_REJECTED', { error }));
        });
    }
    return dispatch(batchActions([
      actionCreator('AUTH_FULFILLED', { facebookUserId: auth.facebookUserId, facebookToken: auth.facebookToken, info: auth.info }),
      actionCreator('USER_HASH', { userHash: auth.facebookUserId }),
    ]));
  }
);


const getContacts = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    dispatch({
      type: 'FETCH_CONTACTS_PENDING',
    });
    return fetchContacts(auth.googleToken, 1, 1000)
      .then((data) => {
          // Download images
          downloadPhoto(dispatch, data.data);
          dispatch(actionCreator('FETCH_CONTACTS_FULFILLED', data));
        },
    ).catch((error) => {
      dispatch(actionCreator('FETCH_CONTACTS_REJECTED', { error }));
    });
  }
);

const googleContacts = () => (
  dispatch => checkGoogleAuth(false)
      .then((result) => {
        dispatch(actionCreator('GOOGLE_CONTACTS_FULFILLED', result));
      }).catch((error) => {
        dispatch(actionCreator('GOOGLE_CONTACTS_REJECTED', { error }));
      })
);

const notifyUI = data => (
  () => {
    const { title, message, imageUrl } = data.payload;
    notifyMsg(title, message, imageUrl);
  }
);

export default {
  AUTH_LOGIN_GOOGLE: authGoogleLogin,
  AUTH_LOGIN_FACEBOOK: authFacebookLogin,
  AUTH_LOGOUT: authLogout,
  FETCH_CONTACTS: getContacts,
  GOOGLE_CONTACTS: googleContacts,
  NOTIFY_MESSAGE: notifyUI,
};
