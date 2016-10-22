import axios from 'axios';

function checkAuth() {
  const promise = new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        // validate token
        axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
          .then((response) => {
            resolve({ token, info: response.data });
          }).catch((error) => {
            reject(error);
          });
      }
    });
  });
  return promise;
}

function logout(token) {
  const promise = new Promise((resolve, reject) => {
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

function actionCreator(type, payload) {
  return {
    type,
    payload,
  };
}

const authLogin = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending) {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return checkAuth()
        .then(data => dispatch(
          actionCreator('AUTH_FULFILLED', { token: data.token, info: data.info }))
        )
        .catch(error => dispatch(actionCreator('AUTH_REJECTED', error)));
    }
    return dispatch(
      actionCreator('AUTH_FULFILLED', { token: auth.token, info: auth.info })
    );
  }
);

const authLogout = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending) {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return logout(auth.accessToken)
        .then(data => dispatch(
          actionCreator('LOGOUT_FULFILLED', { token: data.token, info: data.info }))
        )
        .catch(error => dispatch(actionCreator('LOGOUT_REJECTED', error)));
    }
    return dispatch(
      actionCreator('LOGOUT_FULFILLED', { token: '', info: {} })
    );
  }
);

export default {
  AUTH_LOGIN: authLogin,
  AUTH_LOGOUT: authLogout,
};
