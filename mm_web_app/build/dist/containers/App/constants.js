'use strict';

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

Object.defineProperty(exports, "__esModule", {
  value: true
});
var LIMIT = exports.LIMIT = 10;
var CRALWER_API_URL = exports.CRALWER_API_URL = 'https://dunghd.stdlib.com/crawler@dev/';
var MAOMAO_API_URL = exports.MAOMAO_API_URL = 'https://mmapi00.azurewebsites.net/';
var MAOMAO_SITE_URL = exports.MAOMAO_SITE_URL = 'https://maomaoweb.azurewebsites.net/';
var DEFAULT_LOCALE = exports.DEFAULT_LOCALE = 'en';
var GOOGLE_API_KEY = exports.GOOGLE_API_KEY = 'AIzaSyDa9LV6fTUGRvFYki0GLSS2NzNP-CylMEI';
var GOOGLE_CUSTOM_SEARCH_API_KEY = exports.GOOGLE_CUSTOM_SEARCH_API_KEY = 'AIzaSyCj_iIAID29ZTZG7HQv8TxivT99x7QYeG4';
var GOOGLE_CLIENT_ID = exports.GOOGLE_CLIENT_ID = '323116239222-b2n8iffvc5ljb71eoahs1k72ee8ulbd7.apps.googleusercontent.com';
var FACEBOOK_APP_ID = exports.FACEBOOK_APP_ID = '386694335037120';
var FACEBOOK_APP_SECRET = exports.FACEBOOK_APP_SECRET = 'cdb6d9303e1aa575a70857861d663fe1';
var INSTAGRAM_CLIENT_ID = exports.INSTAGRAM_CLIENT_ID = '77c4c8922e774b58bf101dc9f5c665e2';
var IMGUR_CLIENT_ID = exports.IMGUR_CLIENT_ID = '9d21f2c0aab0ca7';
var IMGUR_CLIENT_SECRET = exports.IMGUR_CLIENT_SECRET = '31b69276f1041518d2dd3e9488b9ce2b618efba8';
var REDDIT_CLIENT_ID = exports.REDDIT_CLIENT_ID = 'CuFq5x8GtBDLuA';
var REDDIT_CLIENT_SECRET = exports.REDDIT_CLIENT_SECRET = '0KaZNPLLIzlGt3qckbgL77YZ-44';