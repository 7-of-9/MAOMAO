import axios from 'axios';
import Config from './config';

const config = new Config();

function actionCreator(type, payload) {
  return {
    type,
    payload,
  };
}

function checkAuth(dispatch) {
  return new Promise((resolve, reject) => {
    const options = {
      scope: 'openid offline_access name picture email',
      device: 'chrome-extension',
    };
    const auth = new Auth0Chrome(config.auth0Url, config.auth0Key);
    auth.authenticate(options)
      .then((authResult) => {
        dispatch(actionCreator('AUTH0_FULFILLED', authResult));
        return axios.get(`https://${config.auth0Url}/userinfo?access_token=${authResult.access_token}`)
          .then((response) => {
            const info = response.data;
            const opts = {
              method: 'POST',
              url: `https://${config.auth0Url}/oauth/token`,
              headers: { 'content-type': 'application/json' },
              data:
              {
                client_id: config.auth0ApiKey,
                client_secret: config.auth0ApiSecret,
                audience: `https://${config.auth0Url}/api/v2/`,
                grant_type: 'client_credentials',
              },
            };
            return axios.request(opts).then((resp) => {
              dispatch(actionCreator('AUTH0_SOCIAL_FULFILLED', resp.data));
              return axios.get(`https://${config.auth0Url}/api/v2/users/${info.user_id}`, {
                headers: {
                  'content-type': 'application/json',
                  Authorization: `${resp.data.token_type} ${resp.data.access_token}`,
                },
              }).then(user => {
                dispatch(actionCreator('AUTH0_SOCIAL_FULFILLED', user.data));
                resolve({ token: user.data.identities[0].access_token, info });
              });
            });
          });
      }).catch(error => reject(error));
  });
}

function logout(token, auth0, dispatch) {
  const promise = new Promise((resolve, reject) => {
    // logout auth0
    axios.get(`https://${config.auth0Url}/v2/logout?federated&client_id=${config.auth0Key}&access_token=${auth0.access_token}`)
      .then((response) => {
        dispatch(actionCreator('AUTH0_LOGOUT_FULFILLED', response));
      })
      .catch((error) => dispatch(actionCreator('AUTH0_LOGOUT_REJECTED', error)));

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


const authLogin = () => (
  (dispatch, getState) => {
    const { auth } = getState();
    if (!auth.isPending || auth.accessToken === '') {
      dispatch({
        type: 'AUTH_PENDING',
      });
      return checkAuth(dispatch)
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
      return logout(auth.accessToken, auth.auth0, dispatch)
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
