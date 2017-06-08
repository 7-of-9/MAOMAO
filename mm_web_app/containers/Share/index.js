/**
*
* Share
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import ShareTopic from '../../components/ShareTopic'
import { toJS } from 'mobx'
import logger from '../../utils/logger'
import { checkGoogleAuth, fetchContacts } from '../../utils/google'
import { shareAll, shareThisSite, shareTheTopic } from '../../utils/share'
import fbScrapeShareUrl from '../../utils/fb'

const SITE_URL = 'https://maomaoweb.azurewebsites.net/'

@inject('store')
@inject('ui')
@observer
class Share extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      type: 'Google',
      shareOption: 'site',
      currentStep: 1
    }
    this.changeShareType = this.changeShareType.bind(this)
    this.fetchGoogleContacts = this.fetchGoogleContacts.bind(this)
  }

  componentDidMount () {
    this.props.store.checkGoogleContacts()
    const { userId, userHash, codes: { sites, topics, all } } = this.props.store
    const { shareUrlId, shareTopics } = this.props.ui
    logger.warn('Share componentDidMount')

    const findUrlCode = sites.find(item => item && item.url_id === shareUrlId)

    if (!findUrlCode) {
      shareThisSite(userId, userHash, shareUrlId).then(result => {
        const { share_code: code } = result.data
        fbScrapeShareUrl(`${SITE_URL}${code}`)
        this.props.store.saveShareCode('site', { ...result.data, url_id: shareUrlId })
      })
    }

    if (!all) {
      shareAll(userId, userHash).then(result => {
        const { share_code: code } = result.data
        fbScrapeShareUrl(`${SITE_URL}${code}`)
        this.props.store.saveShareCode('all', code)
      })
    }

    if (shareTopics && shareTopics.length) {
      shareTopics.forEach(topic => {
        const findTopicCode = topics.find(item => item && item.id === topic.topic_id)
        if (!findTopicCode) {
          shareTheTopic(userId, userHash, topic.topic_id).then(result => {
            const { share_code: code } = result.data
            fbScrapeShareUrl(`${SITE_URL}${code}`)
            this.props.store.saveShareCode('topic', { ...result.data, id: topic.topic_id, name: topic.name })
          })
        }
      })
    }

    this.setState({
      shareOption: this.props.ui.shareTopics[0].id,
      currentStep: 2
    })
  }

  componentWillReact () {
    logger.warn('Share componentWillReact')
  }

  changeShareType (type, shareOption, currentStep) {
    this.setState({
      type, shareOption, currentStep
    })
  }

  fetchGoogleContacts () {
    checkGoogleAuth()
    .then((data) => {
      // download data
      const { googleToken, googleUserId } = data
      logger.warn('checkGoogleAuth result', googleToken, data)
      this.props.ui.addNotification('Loading google contacts')
      return fetchContacts(googleToken, 1000).then((result) => {
        result.json().then(resp => {
          this.props.store.saveGoogleContacts(resp.contacts, googleToken, googleUserId)
        })
      })
    }).catch((error) => {
        // Try to logout and remove cache token
      this.props.ui.addNotification(`Oops! Something went wrong: ${error.message}`)
      logger.warn(error)
    })
  }

  render () {
    return (
      <div>
        <button className='btn btn-back' onClick={() => { this.props.ui.backToStreams() }}>
          <i className='fa fa-angle-left' aria-hidden='true' />
        </button>
        <div className='share-management bounceInRight animated'>
          <div className='block-back'>
            <h1> Share your streams with friend </h1>
          </div>
          <div className='container'>
            <ShareTopic
              type={this.state.type}
              shareOption={this.state.shareOption}
              currentStep={this.state.currentStep}
              topics={this.props.ui.shareTopics}
              code={toJS(this.props.store.codes)}
              sendEmail={() => {}}
              changeShareType={this.changeShareType}
              accessGoogleContacts={this.fetchGoogleContacts}
              contacts={toJS(this.props.store.contacts)}
              notify={() => {}}
              closeShare={() => this.props.ui.backToStreams()}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Share
