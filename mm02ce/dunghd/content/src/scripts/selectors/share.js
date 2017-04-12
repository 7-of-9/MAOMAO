import { createSelector } from 'reselect';

const getShareUrls = state => state.share;
const getActiveUrl = state => state.score.url;

const shareOnUrl = createSelector(
  [getActiveUrl, getShareUrls],
  (url, shareOnUrls) => {
    let share = { type: '', shareOption: 'site', enable: false, currentStep: 1, url };
    if (shareOnUrls.length) {
      const exist = shareOnUrls.find(item => item && item.url === url);
      if (exist) {
        share = Object.assign({}, share, exist, { enable: true });
      }
    }
    return share;
  },
);

export default shareOnUrl;
