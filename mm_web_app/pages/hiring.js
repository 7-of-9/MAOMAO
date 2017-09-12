import React from 'react'
import { Provider } from 'mobx-react'
import { initStore } from '../stores/home'
import { initUIStore } from '../stores/ui'
import { initDiscoveryStore } from '../stores/discovery'
import Layout from '../components/Layout'
import stylesheet from '../styles/index.scss'
import logger from '../utils/logger'

const hiringJs = () => (
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
)

const hiringVp = () => (
  <div style={{ textAlign: 'center', margin: '0 auto', background: '#fff', verticalAlign: 'middle' }}>
    <img src='/static/images/logo.png' alt='logo' />
    <div style={{ fontFamily: 'Calibri', fontSize: 'xx-large' }}>
      <b>maomao</b> is coming, and we're hiring...<br />
    </div>
    <div style={{ fontFamily: '"Courier New"', fontSize: 'large' }}>
      <i />// if (Grok([ NLP, taxonomy||ontology, Bayesian inference]) {'{'} <br />... {'}'} {'}'}
    </div>
    <blockquote>
      <div style={{ textAlign: 'left', marginLeft: '3em', fontFamily: '"Calibri"', fontSize: 'medium' }}>
        <font style={{ fontFamily: '"Calibri"', fontSize: 'large' }}><b>NLP Artificial Intelligence Expert</b>:<i>Server & Platform Engineer / VP Engineering</i></font><br />
        <blockquote>
          * <i>Advanced server/DB competence: e.g. multi-threaded data access/REST API layers, data modelling and schema optimization to 3NF</i><br />
          * <i>Natural language processing (NLP) libraries (e.g. OpenCalais, AlchemyAPI, Stanford NLP), and associated methodologies (e.g. Bayesian corpus analysis)</i><br />
          * <i>API/DB integrations, e.g. Alexa Web Information Service (AWIS) and web scraping frameworks</i><br />
          * <i>Functional programming in C#, Entity Framework</i><br />
          * <i>Quantitative analysis or mathematical background/aptitude may be highly beneficial</i><br />
        </blockquote>
        An extremely rare opportunity to join an early stage funded tech-driven startup. Founded by a technical CEO with recent experience raising sizeable funding (USD $15m+) from top tier Silicon Valley VC firms, this venture is backed by investors from Asia and Silicon Valley and has mass-market potential to transform a number of areas online in discovery, sharing and social networks.<br />
        <br />
        The successful candidate will have hands-on responsibility for architecting, refining and “productionizing” maomao’s current server platform for its proof-of-concept product. This is a highly technical role and requires ability to quickly assimilate to complex problem domains in machine-learning/taxonomy/corpus analysis.<br />
        <br />
            Key technical competencies include: DB and API architecture (SQL Server, MySql or similar, C# Entity Framework with heavy emphasis on functional paradigms, Node.JS or similar) including traversing of large semi-structured external datasets (~50 GB) in a robust and performant manner.<br />
        <br />
            The ideal person for this challenging and rewarding role would be based in Oxford, and would help the founders in the built out of a core technical and product team in that location. Compensation model is flexible, and can comprise of monthly pay, stage/bonus payments, and equity in the company. Creative working patterns are possible (and encouraged!) including working from home, and/or working with and potentially from the company’s current base in Asia (Singapore and Vietnam). The first round of screening will consist of substantial technical testing: please do not apply unless all of the skills and platforms above are within your comfort zone.<br />
        <br />
        Email your CV and a brief summary of your experience to: <a href='mailto://seed@maomao.rocks'>seed@maomao.rocks</a><br />
      </div>
    </blockquote>
  </div>
)

export default class Hiring extends React.Component {
  static getInitialProps ({ req, query: { type } }) {
    const isServer = !!req
    let userAgent = ''
    if (req && req.headers && req.headers['user-agent']) {
      userAgent = req.headers['user-agent']
    }
    const user = req && req.session ? req.session.decodedToken : null
    const store = initStore(isServer, userAgent, user, true)
    const uiStore = initUIStore(isServer)
    const discovery = initDiscoveryStore(isServer, userAgent, user, [])
    return { isServer, type, ...store, ...uiStore, ...discovery }
  }

  constructor (props) {
    super(props)
    logger.info('Hiring', props)
    this.store = initStore(props.isServer, props.userAgent, props.user, true)
    this.uiStore = initUIStore(props.isServer)
    this.store.checkEnvironment()
    this.discovery = initDiscoveryStore(props.isServer, props.userAgent, props.user, props.terms)
  }

  componentDidMount () {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          logger.log('service worker registration successful')
        })
        .catch(err => {
          logger.info('service worker registration failed', err.message)
        })
    }
  }

  render () {
    const { type } = this.props
    logger.info('Hiring render')
    return (
      <Provider store={this.store} discovery={this.discovery} ui={this.uiStore}>
        <Layout title={"Maomao is coming, and we're hiring..."}>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          { type === 'js' && hiringJs() }
          { type === 'vp' && hiringVp() }
        </Layout>
      </Provider>

    )
  }
}
