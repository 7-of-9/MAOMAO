/**
*
* ShareList
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'

const avatar = (user) => {
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar
  }
  return '/static/images/no-avatar.png'
}

const shareStat = (friend, shareLists) => {
  const isAll = _.filter(friend.shares, code => shareLists[code].type === 'all').length
  const allTopics = _.filter(friend.shares, code => shareLists[code].type === 'topic').length
  if (isAll) {
    return 'All'
  }
  return `${allTopics} topics`
}

const hasShareTopic = (friend, shareLists) => {
  const isAll = _.filter(friend.shares, code => shareLists[code].type === 'all').length
  const allTopics = _.filter(friend.shares, code => shareLists[code].type === 'topic').length
  return isAll || allTopics
}

@inject('store')
@inject('ui')
@observer
class ShareList extends React.PureComponent {
  noImage = (evt) => {
    evt.target.src = '/static/images/no-image.png'
  }
  render () {
    const { user, userId } = this.props.store
    const { entities: { friendStreams, shareLists, urls }, result: { shares_issued } } = this.props.store.normalizedData
    logger.info('ShareList friendStreams', friendStreams)
    logger.info('ShareList shareLists', shareLists)
    const friends = _.filter(friendStreams, friend => hasShareTopic(friend, shareLists))
    return (
      <div>
        <button className='btn btn-back' onClick={() => { this.props.ui.backToStreams() }}>
          <i className='fa fa-angle-left' aria-hidden='true' />
        </button>
        <div className='share-management bounceInRight animated'>
          <div id='accordion' role='tablist' aria-multiselectable='true'>
            <div className='card card-topic'>
              <div className='card-header collapsed' role='tab' id={`heading${userId}`} data-toggle='collapse' data-parent='#accordion' href={`#collapse${userId}`} aria-expanded='true' aria-controls={`collapse${userId}`}>
                <div className='card-header-cnt'>
                  <div className='card-header-inner'>
                    <a className='collapse-title'>
                      <span className='directional-user'>
                        <span className='share-image'>
                          <img onError={this.noImage} className='share-object' src={avatar(user)} alt={userId} width='40' height='40' />
                        </span>
                        <span className='share-name'> Your sharing</span>
                      </span>
                    </a>
                    <div className='line-card'>
                      <div className='line-direct share-line-left' />
                    </div>
                  </div>
                </div>
                <div className='mix-detail'>
                  <span className='three-dots'>...</span>
                </div>
              </div>
              {/* Your sharing */}
              <div id={`collapse${userId}`} className='collapse' role='tabpanel' aria-labelledby={`heading${userId}`}>
                <div className='card-block'>
                  { /* eslint-disable camelcase */
                    shares_issued && shares_issued.length === 0 &&
                    <div> You have shared nothing with your friends</div>
                  }
                  {shares_issued && _.map(shares_issued, receiver => (
                      (receiver.share_all || receiver.topic_id) &&
                      <ul key={`share-detail-${receiver.email}-${receiver.share_code}`} className={receiver.source_user_deactivated ? 'timeline timeline-pause timeline-horizontal' : 'timeline timeline-horizontal'}>
                        <li className='timeline-item'>
                          <div className='timeline-badge'>
                            <img onError={this.noImage} className='share-object' src={avatar(user)} alt={userId} width='40' height='40' />
                          </div>
                          {
                            /* receiver.source_user_deactivated &&
                            <div className='timeline-panel'>
                              <span className='user-info-share'>Has been paused by {user.name}</span>
                            </div>
                            */
                          }
                        </li>
                        <li className='timeline-item'>
                          <div className='timeline-badge'>
                            <i className={`fa ${receiver.topic_id ? 'fa-list' : 'fa-share-alt'}`} aria-hidden='true' />
                          </div>
                          {
                            receiver.share_all &&
                            <div className='timeline-panel'>
                              <span className='share-all'>All browsing history</span>
                            </div>
                          }
                          {
                            receiver.topic_id &&
                            <div className='timeline-panel'>
                              <div className='tags-topic'>
                                <span className={`tags ${tagColor(receiver.topic_name)}`} rel='tag'>
                                  <span className='text-tag'>{receiver.topic_name}</span>
                                </span>
                              </div>
                            </div>
                          }
                        </li>
                        <li className='timeline-item share-line-left'>
                          <div className='timeline-badge'>
                            <img onError={this.noImage} className='object-badge' src={avatar(receiver)} alt={receiver.fullname} width='51' height='51' />
                          </div>
                          <div className='timeline-panel'>
                            <div className='timeline-panel'>
                              <span className='user-info-share'>{receiver.fullname}</span>
                              <a href='#' className='btn btn-related'>{receiver.source_user_deactivated ? 'Reshare' : 'Unshare'}</a>
                            </div>
                          </div>
                        </li>
                      </ul>
                    ))}
                </div>
              </div>
            </div>
            {friends && _.map(friends, friend => (
              <div key={`friend-${friend.user_id}`} className='card card-topic'>
                <div className='card-header collapsed' role='tab' id={`heading${friend.user_id}`} data-toggle='collapse' data-parent='#accordion' href={`#collapse${friend.user_id}`} aria-expanded='false' aria-controls={`collapse${friend.user_id}`}>
                  <div className='card-header-cnt'>
                    <div className='card-header-inner'>
                      <a className='collapse-title'>
                        <span className='directional-user'>
                          <span className='share-image'>
                            <img onError={this.noImage} className='share-object' src={avatar(friend)} alt={friend.user_id} width='40' height='40' />
                          </span>
                          <span className='share-name'> {friend.fullname} </span>
                        </span>
                      </a>
                      <div className='line-card'>
                        <div className='line-direct share-line-left' />
                      </div>
                    </div>
                  </div>
                  <div className='mix-detail'>
                    <span className='topic-value'>({shareStat(friend, shareLists)})</span>
                  </div>
                </div>
                <div id={`collapse${friend.user_id}`} className='collapse' role='tabpanel' aria-labelledby={`heading${friend.user_id}`}>
                  <div className='card-block'>
                    {friend.shares && _.map(friend.shares, code => {
                      const item = shareLists[code]
                      return (
                            item.type !== 'url' &&
                            <ul key={`share-${code}-${friend.user_id}`} className={item.target_user_deactivated ? 'timeline timeline-pause timeline-horizontal' : 'timeline timeline-horizontal'}>
                              <li className='timeline-item'>
                                <div className='timeline-badge'>
                                  <img onError={this.noImage} className='share-object' src={avatar(friend)} alt={friend.user_id} width='51' height='51' />
                                </div>
                                <div className='timeline-panel'>
                                  <a href='#' className='btn btn-unfollow'>{item.target_user_deactivated ? 'Follow' : 'Unfollow'}</a>
                                </div>
                              </li>
                              <li className='timeline-item'>
                                <div className='timeline-badge'>
                                  <i className={`fa ${item.type === 'topic' ? 'fa-list' : 'fa-share-alt'}`} aria-hidden='true' />
                                </div>
                                {
                                  item.type === 'all' &&
                                  <div className='timeline-panel'>
                                    <span className='share-all'>All browsing history</span>
                                  </div>
                                }
                                {
                                  item.topic_name &&
                                  <div className='timeline-panel'>
                                    <div className='tags-topic'>
                                      <span className={`tags ${tagColor(item.topic_name)}`} rel='tag'>
                                        <span className='text-tag'>
                                          {item.topic_name}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                }
                                {
                                  item.type === 'url' &&
                                  <div className='timeline-panel'>
                                    <span className='name-url'>{urls[item.urls[0]].title}</span>
                                  </div>
                                }
                              </li>
                              <li className='timeline-item share-line-left'>
                                <div className='timeline-badge'>
                                  <img onError={this.noImage} className='share-object' src={avatar(user)} alt={userId} width='51' height='51' />
                                </div>
                                { /*
                                  item.target_user_deactivated &&
                                  <div className='timeline-panel'>
                                    <span className='user-info-share'>Has been paused by {user.name}</span>
                                  </div>
                                  */
                                }
                              </li>
                            </ul>
                      )
                    })}
                  </div>
                </div>
              </div>
              ))}
          </div>
        </div>
      </div>
    )
  }
}

export default ShareList
