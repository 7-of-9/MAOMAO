import { createSelector } from 'reselect';

const getTerms = state => state.nlp.terms;
const getActiveUrl = state => state.score.url;

const getCurrentTerms = createSelector(
  [getActiveUrl, getTerms],
  (url, terms) => {
    const xp = [];
    if (terms.length) {
      const term = terms.filter(item => item.url === url);
      if (term[0] && term[0].topics) {
        term[0].topics.forEach((topic) => {
          const text = topic.info;
          // FIXME: Fake score base on text length, we need to improve later on
          xp.push({
            text: text.substr(0, text.indexOf('...')),
            score: text.length,
          });
        });
      }
    }
    return xp;
  },
);

export default getCurrentTerms;
