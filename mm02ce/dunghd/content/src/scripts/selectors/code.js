import { createSelector } from 'reselect';

const getCodes = state => state.code;
const getActiveUrl = state => state.score.url;
const getRecords = state => state.nlp.records;
const getTerms = state => state.nlp.terms;

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

const getShareTopicCodes = createSelector(
  [getActiveUrl, getCodes, getRecords, getTerms],
  (url, codes, records, terms) => {
    const topics = {};
    if (records.length) {
      const exist = records.find(item => item && item.url === url);
      if (exist) {
        const { data: { tld_topic_id, tld_topic } } = exist;
        const findCode = codes.topics.find(item => item && item.id === tld_topic_id);
        if (findCode && tld_topic_id) {
          topics[`${tld_topic_id}-tld-${tld_topic}`] = findCode.share_code;
        }
      }
    }
    if (terms.length) {
      const existRecord = terms.find(item => item.url === url);
      if (existRecord) {
        const termIds = existRecord.topics.map(item => item.term_id);
        const findCodes = codes.topics.filter(item => item && termIds.indexOf(item.id) !== -1);
        if (findCodes.length) {
          findCodes.forEach(({ id, name, share_code }) => {
            topics[`${id}-beta-${name}`] = share_code;
          });
        }
      }
    }
    return topics;
  },
);

export { getShareAllCode, getShareUrlCode, getShareTopicCodes };
