/**
*
* StreamItem
*
*/

import React, { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import DiscoveryButton from '../../components/DiscoveryButton'
import PlaceHolder from '../../components/PlaceHolder'
import InlinePlayer from './InlinePlayer'

@inject('ui')
@observer
class StreamItem extends PureComponent {
  handleClick = (event) => {
    event.preventDefault()
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      window.open(this.props.href, '_blank')
    } else {
      this.props.onPreview(this.props.href)
    }
  }

  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }

  render () {
    /* eslint-disable camelcase */
    const { href, title, img, url_id, owners, users, topics, myUrlIds, deepestTopics, parseDomain, urlTopic, urlOwner, discoveryKeys, suggestionKeys } = this.props
    return (
      <div key={url_id} className='grid-item shuffle-item'>
        <div className='thumbnail-box'>
          {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton openDiscoveryMode={() => this.props.ui.openDiscoveryMode(discoveryKeys, suggestionKeys)} />}
          {
              _.indexOf(href, 'youtube.com') === -1 &&
              _.indexOf(href, 'vimeo.com') === -1 &&
              <PlaceHolder>
                <div className='thumbnail'>
                  <div className='thumbnail-image'>
                    <a className='thumbnail-overlay' onClick={this.handleClick}>
                      <img
                        src={img || '/static/images/no-image.png'}
                        alt={title}
                        onError={this.noImage}
                        />
                    </a>
                    {urlTopic(url_id, topics, (topic) => this.props.ui.selectTopic(topic), myUrlIds, (topic) => this.props.ui.openShareTopic(url_id, topic, deepestTopics))}
                    {urlOwner(_.filter(owners, item => item.url_id === url_id), users, (user) => this.props.ui.selectUser(user))}
                  </div>
                  <div className='caption'>
                    <h4 className='caption-title'>
                      <a onClick={this.handleClick}>
                        {title} ({url_id})
                  </a>
                    </h4>
                    <h5 className='caption-title'>{parseDomain(href)}</h5>
                  </div>
                </div>
              </PlaceHolder>
          }
          {
            _.indexOf(href, 'youtube.com') !== -1 &&
            <InlinePlayer
              href={href}
              img={img}
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
              onPreview={this.props.onPreview}
              />
          }
          {
              _.indexOf(href, 'vimeo.com') !== -1 &&
              <InlinePlayer
                href={href}
                img={img}
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
                onPreview={this.props.onPreview}
                  />
            }
        </div>
      </div>
    )
  }
}

export default StreamItem
