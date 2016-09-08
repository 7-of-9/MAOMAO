import { combineReducers } from 'redux';
import auth from './auth';
import modal from './modal';
import share from './share';

export default combineReducers({
  auth, modal, share,
});
