import {combineReducers} from 'redux';

import count from './count';
import modal from './modal';

export default combineReducers({
    count, modal
});
