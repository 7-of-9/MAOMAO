import auth from './auth';
import modal from './modal';
import share from './share';
import score from './score';
import nlp from './nlp';
import icon from './icon';

export default function reducer(state = {}, action) {
    return {
        nlp: nlp(state.nlp, action, state.auth),
        auth: auth(state.auth, action, state.nlp),
        modal: modal(state.modal, action),
        share: share(state.share, action),
        score: score(state.score, action),
        icon: icon(state.icon, action, state.auth, state.nlp),
    };
}
