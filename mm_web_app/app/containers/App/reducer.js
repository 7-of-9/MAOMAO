/*
 * AppReducer
 *
 * The reducer takes care of our data. Using actions, we can change our
 * application state.
 * To add a new action, add it to the switch statement in the reducer function
 *
 * Example:
 * case YOUR_ACTION_CONSTANT:
 *   return state.set('yourStateVariable', true);
 */

import { fromJS } from 'immutable';

import {
  CLEAN_SEARCH_RESULT,
  GOOGLE_SEARCH,
  GOOGLE_SEARCH_ERROR,
  GOOGLE_SEARCH_SUCCESS,
  GOOGLE_NEWS_SEARCH,
  GOOGLE_NEWS_SEARCH_ERROR,
  GOOGLE_NEWS_SEARCH_SUCCESS,
  GOOGLE_KNOWLEDGE_SEARCH,
  GOOGLE_KNOWLEDGE_SEARCH_ERROR,
  GOOGLE_KNOWLEDGE_SEARCH_SUCCESS,
  YOUTUBE_SEARCH,
  YOUTUBE_SEARCH_ERROR,
  YOUTUBE_SEARCH_SUCCESS,
} from './constants';

const initialGoogleState = {};
const initialGoogleNewsState = {};
const initialGoogleKnowledgeState = {};
const initialYoutubeState = {
  nextPageToken: '',
};

// The initial state of the App
const initialState = fromJS({
  loading: {
    isGoogleLoading: false,
    isGoogleNewsLoading: false,
    isGoogleKnowledgeLoading: false,
    isYoutubeLoading: false,
  },
  error: [],
  data: {
    google: initialGoogleState,
    news: initialGoogleNewsState,
    knowledge: initialGoogleKnowledgeState,
    youtube: initialYoutubeState,
  },

});

function appReducer(state = initialState, action) {
  switch (action.type) {
    case GOOGLE_SEARCH:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => true);
    case GOOGLE_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['data', 'google'], () => action.data);
    case GOOGLE_SEARCH_ERROR:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case GOOGLE_KNOWLEDGE_SEARCH:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => true);
    case GOOGLE_KNOWLEDGE_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['data', 'knowledge'], () => action.data);
    case GOOGLE_KNOWLEDGE_SEARCH_ERROR:
      return state
        .updateIn(['loading', 'isGoogleLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case GOOGLE_NEWS_SEARCH:
      return state
        .updateIn(['loading', 'isGoogleNewsLoading'], () => true);
    case GOOGLE_NEWS_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isGoogleNewsLoading'], () => false)
        .updateIn(['data', 'news'], () => action.data);
    case GOOGLE_NEWS_SEARCH_ERROR:
      return state
        .updateIn(['loading', 'isGoogleNewsLoading'], () => false)
        .updateIn(['error'], (error) => error.push(action.error));
    case YOUTUBE_SEARCH:
      return state.updateIn(['loading', 'isYoutubeLoading'], () => true);
    case YOUTUBE_SEARCH_SUCCESS:
      return state
        .updateIn(['loading', 'isYoutubeLoading'], () => false)
        .updateIn(['data', 'youtube'], () => action.data);
    case YOUTUBE_SEARCH_ERROR:
      return state
      .updateIn(['loading', 'isYoutubeLoading'], () => false)
      .updateIn(['error'], (error) => error.push(action.error));
    case CLEAN_SEARCH_RESULT:
      return state.updateIn(['data', 'google'], () => initialGoogleState)
       .updateIn(['data', 'knowledge'], () => initialGoogleKnowledgeState)
       .updateIn(['data', 'news'], () => initialGoogleNewsState)
       .updateIn(['data', 'youtube'], () => initialYoutubeState);
    default:
      return state;
  }
}

export default appReducer;
