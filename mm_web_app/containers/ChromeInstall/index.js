/**
*
* ChromeInstall
*
*/

import React from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { Section } from 'neal-react'
import Modal from 'react-modal'
import * as logger from 'loglevel'
import UnlockNow from '../../components/UnlockNow'
import { sendMsgToChromeExtension, actionCreator } from '../../utils/chrome'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto'
  }
}

const Wrapper = styled.div`
  text-align: center;
`

const AddToChrome = styled.button`
 margin-left: 40px;
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`

const Share = styled.button`
 margin-left: 1px;
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`

@inject('store')
@inject('ui')
@observer
class ChromeInstall extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: true
    }
    this.onClose = this.onClose.bind(this)
  }

  componentDidMount () {
    logger.info('ChromeInstall - componentDidMount', this.props.store)
    if (this.props.store.isInstalledOnChromeDesktop) {
      sendMsgToChromeExtension(actionCreator('WEB_CHECK_AUTH', {}), (error, data) => {
        if (error) {
          logger.error(error)
        } else {
          this.props.store.autoLogin(data.payload)
        }
      })
    }
  }

  componentWillReact () {
    logger.warn('ChromeInstall will re-render, since the data has changed!')
  }

  onClose () {
    this.setState({ showModal: false })
  }

  render () {
    const { title, description, install, store: { isChrome, isMobile, isInstall, isLogin, shareInfo } } = this.props
    logger.info('ChromeInstall isChrome, isInstall, isLogin, shareInfo ', isChrome, isInstall, isLogin, shareInfo)
    const isShow = !!shareInfo && (isInstall || !isChrome)
    let msg = ''
    if (!isLogin) {
      msg = `Yeah! One more step to viewing your friend sharing. Please sigin in.`
    } else {
      msg = `Yeah! It's ready to unlock your friemd stream.`
    }
    return (
      <Wrapper className='wrap-main'>
        <div
          className='neal-hero jumbotron jumbotron-fluid text-xs-center banner-hero'
          style={{ background: this.props.store.bgImage && this.props.store.bgImage.length > 0 ? `url(${this.props.store.bgImage}) fixed` : 'url(/static/images/bg_hero.jpg) no-repeat fixed' }}
          >
          <h1 className='animated fadeInUp'>{description}</h1>
          <Modal
            isOpen={isShow && this.state.showModal}
            style={customStyles}
            portalClassName='QuestionModal'
            contentLabel='Unlock stream'>
            <p>{msg}</p>
            <div className='text-right'><button className='btn btn-close' onClick={this.onClose}>Close</button></div>
          </Modal>
          <div className='hero-caption animated fadeInUp'>
            {!isChrome && !isMobile && <div className='panel-extention'><p> MaoMao is in proof of concept mode: it works on desktop Chrome browser.</p> <p>Get <a href='https://www.google.com/chrome'>Chrome here <span className='icon-wrap'><i className='icon-download' /></span></a></p></div>}
            {!isInstall && !isMobile && isChrome && !!shareInfo && <UnlockNow install={install} title={title} /> }
            {!isInstall && !isMobile && isChrome && !shareInfo && <AddToChrome className='btn btn-addto' onClick={install}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</AddToChrome> }
            {!isInstall && !isMobile && isChrome && <Share className='btn btn-share'><i className='fa fa-share-alt' aria-hidden='true' /></Share> }
            {(isMobile || !isChrome) &&
            <div className='switch-browser'>
              <button className='btn btn-login' onClick={() => { this.props.ui.showSignIn() }}>Sign In</button>
              <button className='btn btn-login' onClick={() => { this.props.ui.showSignUp() }}>Sign Up</button>
            </div>
            }
          </div>
        </div>
        <Section className='section-list'>
          <div className='section-item'>
            <h3 className='lead'>What is Maomao?</h3>
            <p>Maomao is a solution for friends to automatically share content with each other on a specific topic of shared interest.</p>
            <p>For example, I might share <strong>US Politics</strong> and <strong>Global Tech > Startups</strong> with one work colleague, <strong>Software > Agile</strong> and <strong>Music > Kpop</strong> with a different work colleague; <strong>Medical Music > Classical Music</strong> with an elderly parent. The permutations are uniquely personalised between peers in the Maomao social graph.</p>
            <p>Maomao overcomes distance and communication barriers: it amplifies enjoyment and consumption of high quality web content, using AI to let friends rediscover and enjoy content from each other in real time, no matter where they are and <strong>without any effort or input</strong> from each other.</p>
            <p>It’s a radical reimagining of what sharing can be, always in the complete control of users: it’s safe, automatic and intelligent, highlighting only the best and most relevant content to friends.</p>
            <p>Because Maomao learns intimately each user’s unique preferences and likes, it also surfaces new and contextually related parts of the internet for users. It’s like a smart, <strong>personalised and proactive search engine.</strong></p>
          </div>
          <div className='section-item'>
            <h3 className='lead'>How does it work?</h3>
            <p>We use natural language processing, correlation analysis and a real time learning engine to categorise web content as it is browsed. We suggest and then setup real time topic sharing between users on the platform, so users can view each others topic streams - both past and future content is automatically shared once both users accept the shared stream.</p>
          </div>
          <div className='section-item'>
            <h3 className='lead'>What stage are we at?</h3>
            <p>We are in stealth mode, and developing towards private alpha testing phase. We have and end-to-end technical proof of concept in place, working on desktop web.</p>
          </div>
          <div className='section-item'>
            <h3 className='lead'>Who are we?</h3>
            <p>Maomao is founded by a lifelong technologist with twenty years experience: from global tech and finance giants through to most recently an fin-tech startup that attracted several rounds of tier-one Silicon Valley VC investment. Our distributed development team is in APAC region.</p>
          </div>
        </Section>
      </Wrapper>
    )
  }
}

ChromeInstall.propTypes = {
  install: React.PropTypes.func.isRequired,
  title: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired
}

export default ChromeInstall
