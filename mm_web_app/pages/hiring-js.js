import React from 'react'
import Head from 'next/head'
import Router from 'next/router'
import Link from 'next/link'
import { Footer, Navbar, NavItem, Page } from 'neal-react'
import NProgress from 'nprogress'
import Header from '../components/Header'
import LogoIcon from '../components/LogoIcon'
import Slogan from '../components/Slogan'
import stylesheet from '../styles/index.scss'

if (process.env.NODE_ENV !== 'production') {
  const { whyDidYouUpdate } = require('why-did-you-update')
  whyDidYouUpdate(React, { exclude: /^(Connect|Provider|DynamicComponent|Motion|Index|App|CSSTransitionGroup|NoSSR|BlockElement|Form|Input|DropTarget|DragDropContext|Logo|Page|Section|Head|Footer|Navbar|NavItem|ItemsList|Item|StackedNotification|Notification|AppContainer|Container|ReactStars|ReactTags|DebounceInput|Autosuggest|Step|Modal|CopyToClipboard|inject|styled|lifecycle|withState|withHandlers|onlyUpdateForKeys|pure)/ })
}

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'maomao'
const brand = <Header><LogoIcon /><Slogan /></Header>

const businessAddress = (
  <address>
    <img src='/static/images/maomao.png' className='logo-image' alt='maomao' />
  </address>
)

export default class Hiring extends React.PureComponent {
  render () {
    return (
      <div className='hiring-js'>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Page>
          <Head>
            <title>Maomao is coming, and we're hiring...</title>
            <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
            <meta name='viewport' content='initial-scale=1.0, width=device-width' />
            <script src='https://code.jquery.com/jquery-3.1.1.slim.min.js' />
            <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
            <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
            <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
            <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
          </Head>
          <Navbar className='header-nav animated fadeInDown' brand={brand}>
            <NavItem><Link prefetch href='/' className='nav-link'><a href='/'>Home</a></Link></NavItem>
          </Navbar>
          <div style={{ textAlign: 'center', margin: '0 auto', background: '#fff', verticalAlign: 'middle' }}>
            <img src='/static/images/logo.png' alt='logo' />
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
                <a href='mailto://seed@maomao.rocks'>Email</a> your CV to for more info: remote/flexible working very possible for this role!<br />
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
        Email your CV and a brief summary of your experience to: <a href='mailto://seed@maomao.rocks'>seed@maomao.rocks</a><br />
              </div>
            </blockquote>
          </div>
          <div className='footer-area'>
            <Footer brandName={brandName}
              facebookUrl='https://www.facebook.com/maomao.hiring'
              address={businessAddress}
          />
          </div>
        </Page>
      </div>
    )
  }
}
