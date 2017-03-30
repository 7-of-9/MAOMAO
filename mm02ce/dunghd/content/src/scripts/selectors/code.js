import { createSelector } from 'reselect';

const getCodes = state => state.code;
const getActiveUrl = state => state.score.url;
const getRecords = state => state.nlp.records;

const getShareAllCode = createSelector(
  [getCodes],
  codes => (codes.all && codes.all.share_code) || '',
);

/* eslint-disable camelcase */

const getShareUrlCode = createSelector(
  [getActiveUrl, getCodes, getRecords],
  (url, codes, records) => {
    if (records.length) {
      const exist = records.find(item => item && item.url === url);
      if (exist) {
        const { data: { url_id } } = exist;
        const findCode = codes.sites.find(item => item && item.url_id === url_id);
        return (findCode && findCode.share_code) || '';
      }
    }
    return '';
  },
);

const getShareTopicCode = createSelector(
  [getActiveUrl, getCodes, getRecords],
  (url, codes, records) => {
    if (records.length) {
      const exist = records.find(item => item && item.url === url);
      if (exist) {
        const { data: { tld_topic_id } } = exist;
        const findCode = codes.topics.find(item => item && item.tld_topic_id === tld_topic_id);
        return (findCode && findCode.share_code) || '';
      }
    }
    return '';
  },
);

export { getShareAllCode, getShareUrlCode, getShareTopicCode } ;
