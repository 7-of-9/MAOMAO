// read data from local storage for checking user has login or not

const initialState = {
  isLogin: false,
  message: '',
  accessToken: '',
  isPending: false,
  info: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'AUTH_PENDING':
      return Object.assign({}, state, { isPending: true });
    case 'AUTH_FULFILLED':
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
