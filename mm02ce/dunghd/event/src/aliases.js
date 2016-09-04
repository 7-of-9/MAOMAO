function checkAuth() {
  const promise = new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
  return promise;
}

function succesToken(token) {
  return {
    type: 'AUTH_FULFILLED',
    payload: {
      token,
    },
  };
}

function failAuth(error) {
  return {
    type: 'AUTH_REJECTED',
    payload: {
      error,
    },
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
        .then(token => dispatch(succesToken(token)))
        .catch(error => (dispatch(failAuth(error))));
    }
    return dispatch(succesToken(auth.token));
  }
);

export default {
  AUTH_LOGIN: authLogin,
};
