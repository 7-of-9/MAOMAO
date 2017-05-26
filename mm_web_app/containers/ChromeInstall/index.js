/**
*
* ChromeInstall
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import Modal from 'react-modal'
import UnlockNow from '../../components/UnlockNow'
import logger from '../../utils/logger'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto'
  }
}

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
    setTimeout(() => {
      logger.warn('ChromeInstall checkInstall')
      this.props.store.checkInstall()
    }, 100)
  }

  componentWillReact () {
    logger.warn('ChromeInstall componentWillReact')
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
      <div className='wrap-main' style={{ textAlign: 'center', display: isInstall && isLogin ? 'none' : '' }}>
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
            {!isInstall && !isMobile && isChrome && !shareInfo && <button className='btn btn-addto' onClick={install}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</button>}
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
            {!isInstall && !isMobile && isChrome && !shareInfo && <button className='btn btn-addto' onClick={install}> <i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</button>}
            {(isMobile || !isChrome) && !isLogin &&
            <div className='switch-browser'>
              <button className='btn btn-login btn-effect' onClick={() => { this.props.ui.showSignIn() }}>{joinMsg}</button>
            </div>
                }
          </div>
        </div>
          }
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
