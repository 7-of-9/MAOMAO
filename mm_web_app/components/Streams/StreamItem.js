/**
*
* StreamItem
*
*/

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import DiscoveryButton from '../../components/DiscoveryButton'
import PlaceHolder from '../../components/PlaceHolder'
import InlineYoutubePlayer from './InlineYoutubePlayer'
import InlineVimeoPlayer from './InlineVimeoPlayer'
import previewUrl from '../../utils/previewUrl'

@inject('ui')
@observer
class StreamItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isPreview: false
    }
    this.onPreview = this.onPreview.bind(this)
  }

  onPreview () {
    this.setState({
      isPreview: true
    }, () => { this.props.onLayout && this.props.onLayout() })
  }

  render () {
    /* eslint-disable camelcase */
    const { href, title, img, url_id, owners, users, topics, myUrlIds, deepestTopics, parseDomain, urlTopic, urlOwner, discoveryKeys, suggestionKeys } = this.props
    const { isPreview } = this.state
    return (
      <div key={url_id} className={isPreview ? 'grid-item grid-item--full shuffle-item' : 'grid-item shuffle-item'}>
        <div className='thumbnail-box'>
          {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton openDiscoveryMode={() => this.props.ui.openDiscoveryMode(discoveryKeys, suggestionKeys)} />}
          {
              href.indexOf('youtube.com') === -1 &&
              href.indexOf('vimeo.com') === -1 &&
              !isPreview &&
              <PlaceHolder image={img}>
                <div className='thumbnail'>
                  <div className='thumbnail-image'>
                    <a className='thumbnail-overlay' onClick={this.onPreview}>
                      <img
                        src={img || '/static/images/no-image.png'}
                        alt={title}
                        onError={(ev) => { ev.target.src = '/static/images/no-image.png' }}
                        />
                    </a>
                    {urlTopic(url_id, topics, (topic) => this.props.ui.selectTopic(topic), myUrlIds, (topic) => this.props.ui.openShareTopic(url_id, topic, deepestTopics))}
                  </div>
                  <div className='caption'>
                    <h4 className='caption-title'>
                      <a onClick={this.onPreview}>
                        {title} ({url_id})
                  </a>
                    </h4>
                    <h5 className='caption-title'>{parseDomain(href)}</h5>
                    {urlOwner(owners.filter(item => item.url_id === url_id), users, (user) => this.props.ui.selectUser(user))}
                  </div>
                </div>
              </PlaceHolder>
          }
          {
          href.indexOf('youtube.com') === -1 &&
          href.indexOf('vimeo.com') === -1 &&
          isPreview &&
          previewUrl(href, title)
          }
          {
            href.indexOf('youtube.com') !== -1 &&
            <InlineYoutubePlayer
              href={href}
              title={title}
              url_id={url_id}
              topics={topics}
              deepestTopics={deepestTopics}
              users={users}
              owners={owners}
              myUrlIds={myUrlIds}
              urlTopic={urlTopic}
              urlOwner={urlOwner}
              parseDomain={parseDomain}
              onPreview={this.onPreview}
              />
          }
          {
              href.indexOf('vimeo.com') !== -1 &&
              <InlineVimeoPlayer
                href={href}
                title={title}
                url_id={url_id}
                topics={topics}
                deepestTopics={deepestTopics}
                users={users}
                owners={owners}
                myUrlIds={myUrlIds}
                urlTopic={urlTopic}
                urlOwner={urlOwner}
                parseDomain={parseDomain}
                onPreview={this.onPreview}
                />
            }
        </div>
      </div>
    )
  }
}

export default StreamItem
