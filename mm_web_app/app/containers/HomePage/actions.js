/*
 *
 * Homepage actions
 *
 */

 import {
   CHANGE_TERM,
   NEXT_PAGE,
   RESET_PAGE,
 } from './constants';

/**
 * Change terms
 * @param  String terms
 * @return Object
 */
 export function changeTerms(terms) {
   return {
     type: CHANGE_TERM,
     terms,
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
