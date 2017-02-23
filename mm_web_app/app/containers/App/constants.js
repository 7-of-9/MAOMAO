/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

export const DEFAULT_LOCALE = 'en';
export const GOOGLE_API_KEY = 'AIzaSyDa9LV6fTUGRvFYki0GLSS2NzNP-CylMEI';
export const GOOGLE_CUSTOM_SEARCH_API_KEY = 'AIzaSyCj_iIAID29ZTZG7HQv8TxivT99x7QYeG4';
export const FACEBOOK_APP_ID = '386694335037120';
export const FACEBOOK_APP_SECRET = 'cdb6d9303e1aa575a70857861d663fe1';
export const INSTAGRAM_CLIENT_ID = '77c4c8922e774b58bf101dc9f5c665e2';
export const IMGUR_CLIENT_ID = '9d21f2c0aab0ca7';
export const IMGUR_CLIENT_SECRET = '31b69276f1041518d2dd3e9488b9ce2b618efba8';
export const REDDIT_APP_ID = 'CuFq5x8GtBDLuA';
export const REDDIT_APP_CLIENT = '0KaZNPLLIzlGt3qckbgL77YZ-44';

export const GOOGLE_SEARCH = 'app/App/GOOGLE_SEARCH';
export const GOOGLE_SEARCH_CLEAN = 'app/App/GOOGLE_SEARCH_CLEAN';
export const GOOGLE_SEARCH_SUCCESS = 'app/App/GOOGLE_SEARCH_SUCCESS';
export const GOOGLE_SEARCH_ERROR = 'app/App/GOOGLE_SEARCH_ERROR';
export const YOUTUBE_SEARCH = 'app/App/YOUTUBE_SEARCH';
export const YOUTUBE_SEARCH_CLEAN = 'app/App/YOUTUBE_SEARCH_CLEAN';
export const YOUTUBE_SEARCH_SUCCESS = 'app/App/YOUTUBE_SEARCH_SUCCESS';
export const YOUTUBE_SEARCH_ERROR = 'app/App/YOUTUBE_SEARCH_ERROR';
export const IMGUR_SEARCH = 'app/App/IMGUR_SEARCH';
export const FACEBOOK_SEARCH = 'app/App/FACEBOOK_SEARCH';
export const INSTAGRAM_SEARCH = 'app/App/INSTAGRAM_SEARCH';
