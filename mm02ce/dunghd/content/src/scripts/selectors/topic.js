import { createSelector } from 'reselect';

const getRecords = state => state.nlp.records;
const getTerms = state => state.nlp.terms;
const getActiveUrl = state => state.score.url;

const getCurrentTopics = createSelector(
  [getActiveUrl, getRecords, getTerms],
  (url, records, terms) => {
    const topics = [];
    if (records.length) {
      const existRecord = records.find(item => item.url === url);
      if (existRecord && existRecord.data.tld_topic_id) {
        topics.push({ id: `${existRecord.data.tld_topic_id}-${existRecord.data.tld_topic}`, name: existRecord.data.tld_topic });
      }
    }
    if (terms.length) {
      const existRecord = terms.find(item => item.url === url);
      if (existRecord) {
        topics.push(...existRecord.topics.map(item => ({ id: `${item.term_id}-${item.term_name}`, name: item.term_name })));
      }
    }
    return topics;
  },
);

export default getCurrentTopics;
