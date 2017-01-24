const initialState = {
    nlps: [],
    texts: [],
    scores: [],
};

const MIN_NSS = 10;

export default (nlp = initialState, action) => {
    switch (action.type) {
        case 'NLP_INFO_ERROR':
            window.setIconApp('black', '*EX2', window.BG_ERROR_COLOR);
            return nlp;
        case 'NNS_SCORE': {
            const url = action.payload.url;
            let scores = [];
            if (nlp.scores.length) {
                scores = nlp.scores.filter(item => item.url !== url);
            }

            if (Number(action.payload.score) <= MIN_NSS) {
                window.setIconApp('black', `!(${Number(action.payload.score)}nss)`, window.BG_ERROR_COLOR);
            } else {
                window.setIconApp('blue', `${Number(action.payload.score)}nss`, window.BG_SUCCESS_COLOR);
            }

            scores = scores.concat(action.payload);
            return Object.assign({}, nlp, { scores });
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

            // TODO: set icon
            texts = texts.concat(action.payload);
            return Object.assign({}, nlp, { texts });
        }
        default:
            return nlp;
    }
};
