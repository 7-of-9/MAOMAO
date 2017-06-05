/**
*
* ChromeInstall
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import firebase from 'firebase'
import Modal from 'react-modal'
import UnlockNow from '../../components/UnlockNow'
import logger from '../../utils/logger'

const replaceMMIcon = (desc) => {
  return desc.replace('maomao', "<img className='logo-image' src='/static/images/maomao.png' alt='maomao' />")
}

const customModalStyles = {
  content: {
    top: '82px',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    overflow: 'hidden'
  }
}

@inject('store')
@inject('ui')
@observer
class ChromeInstall extends React.Component {
  constructor (props) {
    super(props)
    this.onFacebookLogin = this.onFacebookLogin.bind(this)
    this.state = {
      isHide: false
    }
  }

  componentDidMount () {
    logger.warn('ChromeInstall componentDidMount')
    this.props.store.checkInstall()
    this.timer = setInterval(() => {
      logger.warn('ChromeInstall componentDidMount setInterval')
      if (this.props.store.isChrome && !this.props.store.isMobile) {
        this.props.store.checkInstall()
        if (this.props.store.isInstalledOnChromeDesktop) {
          logger.warn('ChromeInstall clearInterval')
          this.setState({isHide: true})
          clearInterval(this.timer)
        }
      } else {
        logger.warn('ChromeInstall clearInterval')
        clearInterval(this.timer)
      }
    }, 2 * 1000) // check mm extension has installed on every 2s
  }

  componentWillReact () {
    logger.warn('ChromeInstall componentWillReact')
  }

  componentWillUnmount () {
    logger.warn('ChromeInstall componentWillUnmount')
    if (this.timer) {
      logger.warn('ChromeInstall clearInterval')
      clearInterval(this.timer)
    }
  }

  onFacebookLogin () {
    logger.warn('onFacebookLogin', this.props)
    const provider = new firebase.auth.FacebookAuthProvider()
    provider.addScope('email')
    firebase.auth().signInWithPopup(provider)
  }

  render () {
    const { title, description, install, store: { isChrome, browserName, isMobile, isInstall, isLogin, shareInfo } } = this.props
    logger.warn('ChromeInstall isChrome, browserName, isMobile, isInstall, isLogin, shareInfo', isChrome, browserName, isMobile, isInstall, isLogin, shareInfo)
    let joinMsg = shareInfo ? 'JOIN NOW TO VIEW FRIEND STREAM' : 'JOIN NOW'
    return (
      <div className='wrap-main' style={{ textAlign: 'center', display: isInstall && isLogin ? 'none' : '' }}>
        {isLogin && browserName.length > 0 && isChrome && !isInstall &&
        <div
          className='neal-hero jumbotron jumbotron-fluid text-xs-center banner-hero banner-case'
          style={{ background: this.props.store.bgImage && this.props.store.bgImage.length > 0 ? `url(${this.props.store.bgImage}) fixed` : 'url(/static/images/bg_hero.jpg) repeat-x fixed' }}
            >
          {
            !isMobile &&
            <h1 className='animated fadeInUp'>
                Install &nbsp;
              <img src='/static/images/maomao.png' className='logo-image' alt='maomao' /> extension!
            </h1>
          }
          <p className='text-engine animated fadeInUp' dangerouslySetInnerHTML={{ __html: replaceMMIcon(description) }} />
          <div className='hero-caption animated fadeInUp'>
            {!isInstall && !isMobile && isChrome && !!shareInfo && <UnlockNow install={() => this.props.ui.openExtensionModal()} title={title} />}
            {!isInstall && !isMobile && isChrome && !shareInfo && <button className='btn btn-addto' onClick={() => this.props.ui.openExtensionModal()}> <i className='fa fa-plus' aria-hidden='true' /> INSTALL <img src='/static/images/maomao.png' className='logo-image' alt='maomao' /></button>}
          </div>
        </div>
          }
        {!isLogin &&
        <div
          className='neal-hero jumbotron jumbotron-fluid text-xs-center banner-hero'
          style={{ background: this.props.store.bgImage && this.props.store.bgImage.length > 0 ? `url(${this.props.store.bgImage}) fixed` : 'url(/static/images/bg_hero.jpg) repeat-x fixed' }}
            >
          <h1 className='animated fadeInUp' dangerouslySetInnerHTML={{ __html: replaceMMIcon(description) }} />
          <div className='hero-caption animated fadeInUp'>
            {!isChrome &&
              <div className='panel-extention'><p> <img src='/static/images/maomao.png' className='logo-image' alt='maomao' /> is in proof of concept mode: it works on desktop Chrome browser.</p>
                { !isMobile && <p>Get <a href='https://www.google.com/chrome'>Chrome here <span className='icon-wrap'><i className='icon-download' /></span></a></p> }
              </div>
            }
            {!isInstall && !isMobile && isChrome && !!shareInfo && <UnlockNow install={() => this.props.ui.openExtensionModal()} title={title} />}
            {!isInstall && !isMobile && isChrome && !shareInfo && <button className='btn btn-addto' onClick={() => this.props.ui.openExtensionModal()}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</button>}
            {
              (isMobile || !isChrome) &&
              <div className='block-button'>
                <div className='block-button'>
                  <a className='btn btn-social btn-facebook' onClick={this.onFacebookLogin}>
                    <i className='fa fa-facebook' /> {joinMsg}
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
          }
        <Modal
          isOpen={this.props.ui.showExtensionModal}
          onRequestClose={() => this.props.ui.closeExtensionModal()}
          portalClassName='InstallModal'
          style={customModalStyles}
          contentLabel='Install maomao'>
          <div className='install-modal-content'>
            <div className='modal-header'>
              <h4 className='modal-title'>Install maomao</h4>
            </div>
            <div className='modal-body'>
              <div className='install-description'>
                <h3><img className='logo-image' src='/static/images/maomao.png' alt='maomao' /> lets you share topics with friends</h3>
                <br />
                <p><img className='logo-image' src='/static/images/maomao.png' alt='maomao' /> only shares what you tell it, when you tell it. </p>
                <button className='btn btn-install' type='button' onClick={install}>Ok! Give me <img className='logo-image' src='/static/images/maomao.png' alt='maomao' /></button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

ChromeInstall.propTypes = {
  install: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}

export default ChromeInstall
