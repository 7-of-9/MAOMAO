import axios from 'axios';

function checkAuth() {
  const promise = new Promise((resolve, reject) => {
    let retry = true; // retry once when get error
    function getTokenAndXhr() {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        return axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
          .then((response) => resolve({ token, info: response.data }))
          .catch((error) => {
            if (error.response.status === 401 && retry) {
              retry = false;
              chrome.identity.removeCachedAuthToken({ token }, getTokenAndXhr);
              return;
            }
            reject(error);
          });
      });
    }
    getTokenAndXhr();
  });
  return promise;
}

function logout(token) {
  const promise = new Promise((resolve, reject) => {
    // revoke token
    axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
      .then((response) => console.log('revoke', response))
      .catch((error) => console.log('revoke error', error));

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
    console.log('auth', auth);
    if (!auth.isPending || auth.accessToken === '') {
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
