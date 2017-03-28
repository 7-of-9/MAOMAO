import { createSelector } from 'reselect';

const getShareUrls = state => state.share;
const getActiveUrl = () => window.location.href;

const shareOnUrl = createSelector(
  [getActiveUrl, getShareUrls],
  (url, shareOnUrls) => {
    let share = { type: 'Google', enable: false, url };
    if (shareOnUrls.length) {
      const exist = shareOnUrls.find(item => item && item.url === url);
      if (exist) {
        share = Object.assign({}, share, exist, { enable: true });
      }
    }
    console.log('share', share);
    return share;
  },
);

export default shareOnUrl;
