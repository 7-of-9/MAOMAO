const initialState = {
  all: {},
  sites: [],
  topics: [],
  errors: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'LOGOUT_FULFILLED':
      return Object.assign({}, initialState);
    case 'SHARE_ALL_SUCCESS': {
      return Object.assign({}, state, { all: action.payload });
    }
    case 'SHARE_URL_SUCCESS': {
      return Object.assign({}, state, { sites: [].concat(state.sites, action.payload) });
    }
    case 'SHARE_TOPIC_SUCCESS': {
      return Object.assign({}, state, { topics: [].concat(state.topics, action.payload) });
    }
    case 'SHARE_URL_ERROR':
    case 'SHARE_TOPIC_ERROR':
    case 'SHARE_ALL_ERROR': {
      return Object.assign({}, state, { errors: [].concat(state.errors, action.payload) });
    }
    default:
      return state;
  }
};
