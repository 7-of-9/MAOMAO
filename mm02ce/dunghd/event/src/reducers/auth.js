// read data from local storage for checking user has login or not

const initialState = {
  isLogin: false,
  message: '',
  accessToken: '',
};

function checkAuth() {
  return new Promise((resolve, reject) => {
    try {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        resolve(token);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function succesToken(state, token) {
  return {
    type: 'AUTH_END',
    state: Object.assign({}, state, { accessToken: token })
  };
}

function failAuth(state, err) {
  console.warn(err);
  return {
    type: 'AUTH_ERROR',
    state,
  };
}

export default (state = initialState, action) => {
  console.info('state from bg', state);
  console.info('action from bg', action);
  switch (action.type) {
    case 'AUTH_LOGIN':
      return (dispatch) => (
        checkAuth()
          .then((token) => (dispatch(succesToken(state, token))))
          .catch((err) => (dispatch(failAuth(state, err))))
      );
    case 'AUTH_END':
      return Object.assign({}, state, { message: 'authentication is done' });
    case 'AUTH_ERROR':
      return Object.assign({}, state, { message: 'authentication has error' });
    default:
      return state;
  }
};
