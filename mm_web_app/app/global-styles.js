import { injectGlobal } from 'styled-components';
import bg from './bg.png';
export function randomColor() {
  const rand = Math.random().toString(16).substr(-6);
  return `#${rand}`;
}

/* eslint no-unused-expressions: 0 */
injectGlobal`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: Roboto, Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: Roboto, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-image: url(${bg});
    background-repeat: repeat;
    min-height: 100%;
    min-width: 100%;
  }

  /* center container with CSS */
  .grid {
    margin: 0 auto;
    &:after {
      content: '';
      display: block;
      clear: both;
    }
  }

  /* ---- grid-item ---- */
  .grid-item {
    width: 240px;
    float: left;
    margin-bottom: 10px;
    border-radius: 10px;
    padding: 5px;
    &:hover {
      background-color: #eaeaeb;
    }
  }

  /* React Tags*/
  div.ReactTags__tags {
      position: relative;
      padding-top: 4px;
  }

  /* Styles for the input */
  div.ReactTags__tagInput {
      width: 200px;
      border-radius: 2px;
      display: inline-block;
  }
  div.ReactTags__tagInput input.ReactTags__tagInputField,
  div.ReactTags__tagInput input.ReactTags__tagInputField:focus {
      height: 31px;
      margin: 0;
      width: 100%;
  }

  /* Styles for selected tags */
  div.ReactTags__selected span.ReactTags__tag {
      border: 1px solid #ddd;
      background: #eee;
      display: inline-block;
      padding: 5px;
      margin: 0 5px;
      cursor: pointer;
      border-radius: 6px;
      color: #fff;
      &:nth-child(6n) {
          background-color: #f44336;
      }
      &:nth-child(6n+1) {
          background-color: #607d8b;
      }
      &:nth-child(6n+2) {
          background-color: #795548;
      }
      &:nth-child(6n+3) {
          background-color: #009688;
      }
      &:nth-child(6n+4) {
          background-color: #4caf50;
      }
      &:nth-child(6n+5) {
          background-color: #8bc34a;
      }
  }
  div.ReactTags__selected a.ReactTags__remove {
      color: #fff;
      margin-left: 5px;
      cursor: pointer;
  }
`;
