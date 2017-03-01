import { injectGlobal } from 'styled-components';
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
    background-color: #fff;
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

`;
