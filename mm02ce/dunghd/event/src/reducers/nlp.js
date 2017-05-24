import { ctxMenuLogin } from './helpers';

const initialState = {
  nlps: [],
  texts: [],
  scores: [],
  terms: [],
  records: [],
};

export default (nlp = initialState, action, auth) => {
  switch (action.type) {
    case 'LOGOUT_FULFILLED':
      return Object.assign({}, initialState);
    case 'NLP_INFO_UNKNOWN': {
      const url = action.payload.url;
      let terms = [];
      if (nlp.terms.length) {
        terms = nlp.terms.filter(item => item.url !== url);
      }
      const urlOnSession = window.sessionObservable.urls.get(window.bglib_remove_hash_url(url));
      if (urlOnSession) {
        urlOnSession.document_head_hash = action.payload.document_head_hash;
      }
      terms = terms.concat({
        url,
        document_head_hash: action.payload.document_head_hash,
        topics: [],
        suggestions: [],
        status: 'unknow',
      });
      return Object.assign({}, nlp, { terms });
    }
    case 'NLP_PROCESS': {
      const url = action.payload.url;
      let terms = [];
      if (nlp.terms.length) {
        terms = nlp.terms.filter(item => item.url !== url);
      }
      const urlOnSession = window.sessionObservable.urls.get(window.bglib_remove_hash_url(url));
      if (urlOnSession) {
        urlOnSession.document_head_hash = action.payload.document_head_hash;
      }
      terms = terms.concat({
        url,
        status: 'pending',
        document_head_hash: action.payload.document_head_hash,
        topics: [],
        suggestions: [],
      });
      return Object.assign({}, nlp, { terms });
    }
    case 'NLP_TERMS':
    case 'NLP_INFO_KNOWN': {
      const url = action.payload.url;
      let terms = [];
      if (nlp.terms.length) {
        terms = nlp.terms.filter(item => item.url !== url);
      }
      const urlOnSession = window.sessionObservable.urls.get(window.bglib_remove_hash_url(url));
      if (urlOnSession) {
        urlOnSession.document_head_hash = action.payload.document_head_hash;
      }
      terms = terms.concat({
        url,
        document_head_hash: action.payload.document_head_hash,
        topics: action.payload.topics,
        suggestions: action.payload.suggestions,
        status: 'done',
      });
      return Object.assign({}, nlp, { terms });
    }

    case 'NLP_CALAIS_ERROR': {
      const url = action.payload.url;
      let terms = [];
      if (nlp.terms.length) {
        terms = nlp.terms.filter(item => item.url !== url);
      }
      const urlOnSession = window.sessionObservable.urls.get(window.bglib_remove_hash_url(url));
      if (urlOnSession) {
        urlOnSession.document_head_hash = action.payload.document_head_hash;
      }
      terms = terms.concat({
        url,
        document_head_hash: action.payload.document_head_hash,
        topics: [],
        suggestions: [],
        status: 'error',
      });
      return Object.assign({}, nlp, { terms });
    }

    case 'NNS_SCORE': {
      const url = action.payload.url;
      let scores = [];
      if (nlp.scores.length) {
        scores = nlp.scores.filter(item => item.url !== url);
      }

      scores = scores.concat(action.payload);
      return Object.assign({}, nlp, { scores });
    }

    case 'URL_RECORD_SUCCESS': {
      const url = action.payload.url;
      let records = [];
      if (nlp.records.length) {
        records = nlp.records.filter(item => item.url !== url);
      }
      const urlOnSession = window.sessionObservable.urls.get(window.bglib_remove_hash_url(url));
      if (urlOnSession) {
        urlOnSession.document_head_hash = action.payload.document_head_hash;
      }
      records = records.concat(action.payload);
      ctxMenuLogin(auth.info, records);
      return Object.assign({}, nlp, { records });
    }

    case 'NLP': {
      const url = action.payload.url;
      let nlps = [];
      if (nlp.nlps.length) {
        nlps = nlp.nlps.filter(item => item.url !== url);
      }

      nlps = nlps.concat(action.payload);
      return Object.assign({}, nlp, { nlps });
    }

    case 'PROCESS_TEXT_RESULT': {
      const url = action.payload.url;
      let texts = [];
      if (nlp.texts.length) {
        texts = nlp.texts.filter(item => item.url !== url);
      }

      texts = texts.concat(action.payload);
      return Object.assign({}, nlp, { texts });
    }
    default:
      return nlp;
  }
};
