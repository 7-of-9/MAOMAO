/**
*
* ChromeInstall
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { Section } from 'neal-react'
import NoSSR from 'react-no-ssr'
import Modal from 'react-modal'
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

const replaceMMIcon = (desc) => {
  return desc.replace('maomao', "<img className='logo-image' src='/static/images/maomao.png' alt='maomao' />")
}

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
    if (this.props.store.isInstalledOnChromeDesktop) {
      sendMsgToChromeExtension(actionCreator('WEB_CHECK_AUTH', {}), (error, data) => {
        if (error) {
        } else {
          // FIXME: there is an edge case when user logged out on extension but still be an user on web
          // MM extension will be autologin. Should be considered as bug or not ?
          this.props.store.autoLogin(data.payload)
        }
      })
    }
  }

  onClose () {
    this.setState({ showModal: false })
    if (this.props.store.isInstall && !this.props.store.isLogin) {
      this.props.ui.showSignIn()
    }
  }

  render () {
    const { title, description, install, store: { isChrome, browserName, isMobile, isInstall, isLogin, shareInfo } } = this.props
    const isShow = !!shareInfo && (isInstall || !isChrome)
    let msg = ''
    let joinMsg = shareInfo ? 'JOIN NOW TO UNLOCK YOUR FRIEND STREAM' : 'JOIN NOW'
    if (!isLogin) {
      msg = `Please sign in to unlock your friend stream.`
    } else {
      msg = `Yeah! It's ready to unlock your friend stream.`
    }
    return (
      <Wrapper className='wrap-main' style={{ display: isInstall && isLogin ? 'none' : '' }}>
        <NoSSR>
          {isLogin && browserName.length > 0 && isChrome && !isInstall &&
            <div
              className='neal-hero jumbotron jumbotron-fluid text-xs-center banner-hero banner-case'
              style={{ background: this.props.store.bgImage && this.props.store.bgImage.length > 0 ? `url(${this.props.store.bgImage}) fixed` : 'url(/static/images/bg_hero.jpg) repeat-x fixed' }}
            >
              <h1 className='animated fadeInUp'>
                Install &nbsp;
              <img src='/static/images/maomao.png' className='logo-image' alt='maomao' /> extension!
            </h1>
              <p className='text-engine animated fadeInUp' dangerouslySetInnerHTML={{ __html: replaceMMIcon(description) }} />
              <div className='hero-caption animated fadeInUp'>
                {!isInstall && !isMobile && isChrome && !!shareInfo && <UnlockNow install={install} title={title} />}
                {!isInstall && !isMobile && isChrome && !shareInfo && <AddToChrome className='btn btn-addto' onClick={install}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</AddToChrome>}
              </div>
            </div>
          }
        </NoSSR>
        <NoSSR>
          {!isLogin && browserName.length > 0 &&
            <div
              className='neal-hero jumbotron jumbotron-fluid text-xs-center banner-hero'
              style={{ background: this.props.store.bgImage && this.props.store.bgImage.length > 0 ? `url(${this.props.store.bgImage}) fixed` : 'url(/static/images/bg_hero.jpg) repeat-x fixed' }}
            >
              <h1 className='animated fadeInUp' dangerouslySetInnerHTML={{ __html: replaceMMIcon(description) }} />
              <Modal
                isOpen={isShow && this.state.showModal}
                style={customStyles}
                onRequestClose={this.onClose}
                portalClassName='QuestionModal'
                contentLabel='Unlock stream'>
                <p>{msg}</p>
                <div className='text-right'>
                  <button
                    className='btn btn-close'
                    onClick={this.onClose}
                  >Ok</button>
                </div>
              </Modal>
              <div className='hero-caption animated fadeInUp'>
                {!isChrome && !isMobile && <div className='panel-extention'><p> <img src='/static/images/maomao.png' className='logo-image' alt='maomao' /> is in proof of concept mode: it works on desktop Chrome browser.</p> <p>Get <a href='https://www.google.com/chrome'>Chrome here <span className='icon-wrap'><i className='icon-download' /></span></a></p></div>}
                {!isInstall && !isMobile && isChrome && !!shareInfo && <UnlockNow install={install} title={title} />}
                {!isInstall && !isMobile && isChrome && !shareInfo && <AddToChrome className='btn btn-addto' onClick={install}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</AddToChrome>}
                {(isMobile || !isChrome) && !isLogin &&
                  <div className='switch-browser'>
                    <button className='btn btn-login btn-effect' onClick={() => { this.props.ui.showSignIn() }}>{joinMsg}</button>
                  </div>
                }
              </div>
            </div>
          }
        </NoSSR>
        {!isLogin && browserName.length > 0 &&
          <Section className='section-list' style={{ backgroundColor: '#fff', padding: '2rem 0' }}>
            <div className='section-item'>
              <h3 className='lead'>What is <img src='/static/images/maomao.png' className='maomao-img' alt='maomao' />?</h3>
              <p><img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> is a solution for friends to automatically share content with each other on a specific topic of shared interest.</p>
              <p>For example, I might share <strong>US Politics</strong> and <strong>Global Tech > Startups</strong> with one work colleague, <strong>Software > Agile</strong> and <strong>Music > Kpop</strong> with a different work colleague; <strong>Medical Music > Classical Music</strong> with an elderly parent. The permutations are uniquely personalised between peers in the <img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> social graph.</p>
              <p><img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> overcomes distance and communication barriers: it amplifies enjoyment and consumption of high quality web content, using AI to let friends rediscover and enjoy content from each other in real time, no matter where they are and <strong>without any effort or input</strong> from each other.</p>
              <p>It’s a radical reimagining of what sharing can be, always in the complete control of users: it’s safe, automatic and intelligent, highlighting only the best and most relevant content to friends.</p>
              <p>Because <img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> learns intimately each user’s unique preferences and likes, it also surfaces new and contextually related parts of the internet for users. It’s like a smart, <strong>personalised and proactive search engine.</strong></p>
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
              <p><img src='/static/images/maomao.png' className='maomao-img' alt='maomao' /> is founded by a lifelong technologist with twenty years experience: from global tech and finance giants through to most recently an fin-tech startup that attracted several rounds of tier-one Silicon Valley VC investment. Our distributed development team is in APAC region.</p>
            </div>
          </Section>
          }
      </Wrapper>
    )
  }
}

ChromeInstall.propTypes = {
  install: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}

export default ChromeInstall
