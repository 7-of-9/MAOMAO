/*
 *
 * AppHeader
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { inject, observer } from 'mobx-react'
import firebase from 'firebase'
import 'isomorphic-fetch'
import { Navbar, NavItem } from 'neal-react'
import Header from '../../components/Header'
import LogoIcon from '../../components/LogoIcon'
import Slogan from '../../components/Slogan'
import { guid } from '../../utils/hash'
import { clientCredentials } from '../../firebaseCredentials'
import logger from '../../utils/logger'

const brand = <Header><LogoIcon /><Slogan /></Header>

const avatar = (user) => {
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar
  }
  return '/static/images/no-avatar.png'
}

@inject('store')
@inject('ui')
@observer
class AppHeader extends React.Component {
  constructor (props) {
    super(props)
    this.onFacebookLogin = this.onFacebookLogin.bind(this)
    this.onLogout = this.onLogout.bind(this)
  }

  /* global fetch */
  componentDidMount () {
    logger.warn('AppHeader componentDidMount')
    if (firebase.apps.length === 0) {
      firebase.initializeApp(clientCredentials)
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          logger.warn('firebase - user', user)
          return user.getIdToken()
          .then((token) => {
            if (this.props.store.userId < 0) {
              this.props.notify(`Welcome, ${user.displayName}!`)
              return fetch('/api/login', {
                method: 'POST',
                // eslint-disable-next-line no-undef
                headers: new Headers({ 'Content-Type': 'application/json' }),
                credentials: 'same-origin',
                body: JSON.stringify({ token })
              }).then((res) => {
              // register for new user
                res.json().then(json => {
                  // register new user
                  logger.warn('user', json)
                  const { decodedToken: { email, name, picture, firebase: { sign_in_provider, identities } } } = json
                  /* eslint-disable camelcase */
                  logger.warn('sign_in_provider', sign_in_provider)
                  logger.warn('identities', identities)
                  let fb_user_id = identities['facebook.com'] && identities['facebook.com'][0]
                  let google_user_id = identities['google.com'] && identities['google.com'][0]
                  if (sign_in_provider === 'google.com') {
                    if (!email) {
                      user.providerData.forEach(item => {
                        if (item.providerId === sign_in_provider) {
                          this.props.store.googleConnect({
                            email: item.email, name, picture, google_user_id
                          })
                        }
                      })
                    } else {
                      this.props.store.googleConnect({
                        email, name, picture, google_user_id
                      })
                    }
                  } else if (sign_in_provider === 'facebook.com') {
                    if (!email) {
                      user.providerData.forEach(item => {
                        if (item.providerId === sign_in_provider) {
                          this.props.store.facebookConnect({
                            email: item.email, name, picture, fb_user_id
                          })
                        }
                      })
                    } else {
                      this.props.store.facebookConnect({
                        email, name, picture, fb_user_id
                      })
                    }
                  }
                })
              })
            } else {
              this.props.store.isLogin = true
            }
          })
        }
      })
    }
  }

  componentWillReact () {
    logger.warn('AppHeader componentWillReact')
  }

  onFacebookLogin () {
    logger.warn('onFacebookLogin', this.props)
    const provider = new firebase.auth.FacebookAuthProvider()
    provider.addScope('email')
    firebase.auth().signInWithPopup(provider)
  }

  onLogout () {
    logger.warn('onLogout', this.props)
    firebase.auth().signOut().then(() => {
      fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin'
      }).then(() => {
        this.props.store.logoutUser()
      })
      this.props.notify('You have successfully signed out.')
    }).catch((error) => {
      logger.warn(error)
    })
  }

  render () {
    const { isLogin, userId, user } = this.props.store
    return (
      <Navbar className='header-nav animated fadeInDown' brand={brand}>
        <NavItem>
          <a data-toggle='dropdown'>
            <i className='fa fa-briefcase fa-2x' aria-hidden='true' />
            <span className='notifications-number notifications-hiring'>
              <i className='fa fa-bullhorn' aria-hidden='true' /> We're hiring !
              </span>
            <i className='fa fa-chevron-circle-down' aria-hidden='true' />
          </a>
          <ul className='dropdown-menu dropdown-hiring pull-right'>
            <li key={guid()}>
              <Link prefetch href='/hiring/?type=js' as='/hiring-js' className='nav-link'>
                <a href='/hiring-js'><i className='fa fa-angle-right' aria-hidden='true' />  JavaScript / Node.JS Developer</a>
              </Link>
            </li>
            <li key={guid()}>
              <Link prefetch href='/hiring/?type=vp' as='/hiring-vp' className='nav-link'>
                <a href='/hiring-vp'><i className='fa fa-angle-right' aria-hidden='true' />  Server & Platform Engineer / VP Engineering</a>
              </Link>
            </li>
          </ul>
        </NavItem>
        {
          isLogin &&
          <NavItem>
            <a onClick={() => this.props.ui.displayShareManagement()}>
              <i className='fa fa-share-alt fa-2x' aria-hidden='true' />
              <span className='nav-text'>Share Management</span>
            </a>
          </NavItem>
        }
        <NavItem>
          {isLogin &&
            <div className='dropdown account-dropdown'>
              <a className='dropdown-toggle' data-toggle='dropdown'>
                <img className='image-account' src={avatar(user)} alt={userId} width='33' height='33' />
              </a>
              <a className='link-logout-res' onClick={this.onLogout}>
                <i className='fa fa-sign-out' />
                <span className='nav-text'>Sign Out</span>
              </a>
              <ul className='dropdown-menu pull-right'>
                {user && user.name &&
                  <div className='account-dropdown__identity account-dropdown__segment'>
                    Signed in as <strong>{user.name}</strong>
                  </div>
                }
                <li><button className='btn btn-logout' onClick={this.onLogout}><i className='fa fa-sign-out' /> Sign Out</button></li>
              </ul>
            </div>
          }
          {
            !isLogin &&
            <div className='block-button'>
              <a className='btn btn-social btn-facebook' onClick={this.onFacebookLogin}>
                <i className='fa fa-facebook' /> Sign in with Facebook
              </a>
            </div>
          }
        </NavItem>
      </Navbar>
    )
  }
}

AppHeader.propTypes = {
  notify: PropTypes.func.isRequired,
  isHome: PropTypes.bool
}

AppHeader.defaultProps = {
  notify: () => {},
  isHome: true
}

export default AppHeader
