/*
 *
 * Homepage actions
 *
 */

 import {
   CHANGE_KEYWORD,
   NEXT_PAGE,
   RESET_PAGE,
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

/**
 *  Reset page number when do a search
 * @return Object
 */
 export function resetPage() {
   return {
     type: RESET_PAGE,
   };
 }

/**
 * Load more page
 * @return Object
 */
 export function nextPage() {
   return {
     type: NEXT_PAGE,
   };
 }
