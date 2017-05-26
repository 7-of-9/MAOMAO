/**
*
* ChromeInstall
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import Modal from 'react-modal'
import UnlockNow from '../../components/UnlockNow'
import { sendMsgToChromeExtension, actionCreator } from '../../utils/chrome'
import logger from '../../utils/logger'

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
    logger.warn('ChromeInstall componentDidMount')
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
