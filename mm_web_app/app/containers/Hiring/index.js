/*
 *
 * Hiring
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import logo from './images/maomao_small.png';

require('./close_pixelate.js');

/* animation */
function init() {
  let i = 1;
  let d = 0.01;
  let l = 10;
  function draw() {
    i += d;
    const sin = Math.sin(i);
    const sinn = (sin + 1) / 2;
    if (i > l || i < 1) { d *= -1; l = (Math.random() * 10) + 10; }
    const mm = document.getElementById('maomao-pup');
    mm.closePixelate([
                    { resolution: Math.round(2 + i + (Math.round(l / 50))) },
                  //  ,{ shape: 'diamond', resolution: Math.round(sinn*sin*i*2*l), size: l/30, alpha: 0.75 }
                     { shape: 'square', resolution: Math.round(sinn * i / 2 * l), offset: l / 10, alpha: 0.55 },
                     { shape: 'circle', resolution: Math.round(sin * i * 2 * l), offset: l / 20, size: 20, alpha: 0.5 },
    ]);
    mm.style.visibility = 'visible';
    requestAnimationFrame(draw);
    return true;
  }

  requestAnimationFrame(draw);
}


export class Hiring extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    window.addEventListener('load', init, false);
  }

  render() {
    return (
      <div style={{ textAlign: 'center', margin: '0 auto', background: '#fff', verticalAlign: 'middle' }}>
        <div style={{ fontFamily: 'Calibri', fontSize: 'xx-large' }}>
          <b>maomao</b> is coming, and we're hiring...<br />
        </div>
        <div style={{ fontFamily: '"Courier New"', fontSize: 'large' }}>
          <i />// if (Grok([ ECMAScript, NLP, underscore.js, 3NF ]) {'{'} <br />... {'}'} {'}'}
        </div>
        <br />
        <blockquote>
          <div style={{ textAlign: 'left', marginLeft: '3em', fontFamily: '"Calibri"', fontSize: 'medium' }}>
            <font style={{ fontFamily: '"Calibri"', fontSize: 'large' }}><b>JavaScript / Node.JS Developer</b></font><br /><i>JavaScript /&nbsp;ECMAScript / Node.JS / Full-Stack / HTML5 / CSS3 / MySql, Sql-Server, TSQL, C# Entity Framework or similar</i><br />
            <br />
            <a href="mailto://seed@maomao.rocks">Email</a> your CV to for more info: remote/flexible working very possible for this role!<br />
            <br />
            An extremely rare opportunity to join a funded tech-driven startup. Founded by a CEO with recent experience raising sizeable funding (USD $15m+) from top tier Silicon Valley VC firms, this venture is backed by a local Singaporean investor and has mass-market potential to transform a number of areas online in discovery, sharing and social networks.<br />
            <br />
            Only the very best hands-on technical experts need apply. Proven experience, or demonstrable ability to get quickly up to speed on, is required in the full web development stack, especially in:<br />
            <br />
            <blockquote>
              * ECMAScript (ES, ECMA-262) 5 or 6<br />
              * JavaScript and HTML5/CSS best practices, e.g. backbone.js, underscore.js, angular.js, react.js<br />
              * Cross platform browser extension porting experience or frameworks (Crossrider, Kango, Extensionizr)<br />
              * Advanced server/DB competence: e.g. multi-threaded data access/REST API layers, data modelling to 3NF<br />
              * Natural language processing (NLP) libraries and methods, e.g. OpenCalais, AlchemyAPI<br />
              * API/DB integrations, e.g. Alexa Web Information Service (AWIS) and web scraping frameworks<br />
            </blockquote>
            The successful candidate for this role will be tasked with building a proof of concept (POC) and will be responsible for full-stack engineering from the DB architecture (SQL Server, MySql or similar), API layer (C# EntityFramework, Node.JS or similar) including importing/crawling external feeds, and client development focused around cross platform browser extension and associated responsive HTML5 single page web app, incorporating Facebook OpenGraph API integration and Google Identity Platform.<br />
            <br />
            Compensation for this role is flexible, and can comprise of monthly pay, stage/bonus payments, and equity upon successful delivery of the POC, and flexible working patterns are also possible including working from home. The first round of screening will consist of substantial technical testing: please do not apply unless all of the skills and platforms above are within your comfort zone.<br />
            <br />
            Email your CV and a brief summary of your experience to: <a href="mailto://seed@maomao.rocks">seed@maomao.rocks</a><br />
          </div>
        </blockquote>
        <img id="maomao-pup" alt="Maomao logo" src={logo} style={{ visibility: 'hidden' }} /><br />
      </div>
    );
  }
}

Hiring.propTypes = {
  dispatch: PropTypes.func.isRequired,
};


function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(null, mapDispatchToProps)(Hiring);
