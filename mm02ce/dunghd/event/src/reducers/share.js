const initialState = [];

export default (shareOnUrls = initialState, action) => {
  switch (action.type) {
    case 'OPEN_SHARE_MODAL': {
      const url = action.payload.url;
      let urls = [];
      if (shareOnUrls.length) {
        urls = shareOnUrls.filter(item => item && item.url !== url);
      }
      urls = urls.concat(action.payload);
      return urls;
    }
    case 'CLOSE_SHARE_MODAL': {
      const url = action.payload.url;
      let urls = [];
      if (shareOnUrls.length) {
        urls = shareOnUrls.filter(item => item && item.url !== url);
      }
      return urls;
    }
    default:
      return shareOnUrls;
  }
};
