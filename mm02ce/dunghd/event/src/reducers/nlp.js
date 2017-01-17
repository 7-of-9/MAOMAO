const initialState = {
  nlps: [],
  justexts: [],
};

export default (nlp = initialState, action) => {
  switch (action.type) {
    case 'NLP': {
      const url = action.payload.url;
      let nlps = [];
      if (nlp.nlps.length) {
        nlps = nlp.nlps.filter(item => item.url !== url);
      }
      nlps = nlps.concat(action.payload);
      return Object.assign({}, nlp, { nlps });
    }
    case 'JUSTEXT_READY': {
      const url = action.payload.url;
      let status = false;
      if (nlp.justexts.length) {
        const justext = nlp.items.find(item => item.url === url);
        if (justext) {
          status = justext.status;
        }
      }
      if (!status) {
        window.setIconForJusText();
      }
      return nlp;
    }
    case 'JUSTEXT': {
      const url = action.payload.url;
      if (!action.payload.status) {
        window.setIconForJusText();
      }
      let justexts = [];
      if (nlp.justexts.length) {
        justexts = nlp.justexts.filter(item => item.url !== url);
      }
      justexts = justexts.concat(action.payload);
      return Object.assign({}, nlp, { justexts });
    }
    default:
      return nlp;
  }
};
