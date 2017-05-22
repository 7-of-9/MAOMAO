import React from 'react'
import Head from 'next/head'

export default class Hiring extends React.Component {
  static getInitialProps ({ req }) {
    const isServer = !!req
    return { isServer }
  }

  componentDidMount () {
    if (!this.props.isServer) {
      const initLogoAnimation = () => {
        let i = 1
        let d = 0.01
        let l = 10
        function draw () {
          i += d
          const sin = Math.sin(i)
          const sinn = (sin + 1) / 2
          if (i > l || i < 1) { d *= -1; l = (Math.random() * 10) + 10 }
          const mm = document.getElementById('maomao-pup')
          if (mm && typeof mm.closePixelate === 'function') {
            mm.closePixelate([
                    { resolution: Math.round(2 + i + (Math.round(l / 50))) },
                     { shape: 'square', resolution: Math.round(sinn * i / 2 * l), offset: l / 10, alpha: 0.55 },
                     { shape: 'circle', resolution: Math.round(sin * i * 2 * l), offset: l / 20, size: 20, alpha: 0.5 }
            ])
            mm.style.visibility = 'visible'
          }
          window.requestAnimationFrame(draw)
          return true
        }
        window.requestAnimationFrame(draw)
      }
      initLogoAnimation()
    }
  }

  render () {
    return (
      <div className='hiring' style={{ textAlign: 'center', margin: '0 auto', background: '#fff', verticalAlign: 'middle' }}>
        <Head>
          <title>Maomao is coming, and we're hiring...</title>
          <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
          <meta name='viewport' content='initial-scale=1.0, width=device-width' />
          <script src='https://code.jquery.com/jquery-3.1.1.slim.min.js' />
          <script src='/static/vendors/js/close_pixelate.js' />
        </Head>
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
        <img id='maomao-pup' alt='Maomao logo' src='/static/images/maomao_small.png' style={{ visibility: 'hidden' }} /><br />
        <script src='/static/vendors/js/logo.js' />
      </div>
    )
  }
}
