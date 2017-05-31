import { createSelector } from 'reselect';
import removeHashOnUrl from '../components/utils/url';
import logger from '../components/utils/logger';

const getActiveUrl = () => removeHashOnUrl(window.location.href);
const getShareUrls = state => state.share;

const shareOnUrl = createSelector(
  [getActiveUrl, getShareUrls],
  (url, shareOnUrls) => {
    logger.warn('url', url);
    let share = { type: '', shareOption: '', enable: false, currentStep: 1, url };
    if (shareOnUrls.length) {
      const exist = shareOnUrls.find(item => item && item.url === url);
      if (exist) {
        share = Object.assign({}, share, exist);
      }
    }
    return share;
  },
);

export default shareOnUrl;
