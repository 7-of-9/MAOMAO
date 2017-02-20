/*
 *
 * Homepage actions
 *
 */

 import {
   CHANGE_KEYWORD,
 } from './constants';


/**
 * Change keyword
 * @param  String keyword
 * @return Object
 */
 export function changeKeyword(keyword) {
   return {
     type: CHANGE_KEYWORD,
     keyword,
   };
 }
