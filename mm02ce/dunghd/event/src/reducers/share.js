const initialState = [];

export default (shareOnUrls = initialState, action) => {
  switch (action.type) {
    case 'LOGOUT_FULFILLED':
      return Object.assign({}, initialState);
    case 'OPEN_SHARE_MODAL':
    case 'CLOSE_SHARE_MODAL': {
      const url = action.payload.url;
      let urls = [];
      if (shareOnUrls.length) {
        urls = shareOnUrls.filter(item => item && item.url !== url);
        const exist = shareOnUrls.find(item => item.url === url);
        urls.push(Object.assign({}, exist, action.payload));
      } else {
        urls.push(action.payload);
      }
      return urls;
    }
    default:
      return shareOnUrls;
  }
};
