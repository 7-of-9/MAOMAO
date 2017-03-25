import { createSelector } from 'reselect';

const getRecords = state => state.nlp.records;
const getActiveUrl = state => state.score.url;

const getCurrentTopic = createSelector(
  [getActiveUrl, getRecords],
  (url, records) => {
    if (records.length) {
      const existRecord = records.filter(item => item.url === url);
      if (existRecord && existRecord[0]) {
        return existRecord[0].data.tld_topic;
      }
    }
    return '';
  },
);

export default getCurrentTopic;
