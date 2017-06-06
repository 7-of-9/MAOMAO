/**
*
* ShareList
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import logger from '../../utils/logger'
import { guid } from '../../utils/hash'

const avatar = (user) => {
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar
  }
  return '/static/images/no-avatar.png'
}

@inject('store')
@inject('ui')
@observer
class ShareList extends React.Component {
  componentDidMount () {
    logger.warn('ShareList componentDidMount')
  }

  componentWillReact () {
    logger.warn('ShareList componentWillReact')
  }

  render () {
    const { user, userId } = this.props.store
    const { entities: { friendStreams, shareLists, urls, topics }, result: { accept_shares } } = this.props.store.normalizedData
    logger.warn('friendStreams, shareLists, urls, topics', friendStreams, shareLists, urls, topics)
    return (
      <div>
        <button className='btn btn-back' onClick={() => { this.props.ui.backToStreams() }}>
          <i className='fa fa-angle-left' aria-hidden='true' />
        </button>
        <div className='share-management bounceInRight animated'>
          <div className='block-back'>
            <h1> Share Management </h1>
          </div>
          <div id='accordion' role='tablist' aria-multiselectable='true'>
            <div className='card card-topic'>
              <div className='card-header collapsed' role='tab' id={`heading${userId}`}  data-toggle='collapse' data-parent='#accordion' href={`#collapse${userId}`} aria-expanded='true' aria-controls={`collapse${userId}`}>
                <div className='card-header-cnt'>
                  <div className='card-header-inner'>
                    <a className='collapse-title'>
                      <span className='directional-user'>
                        <span className='share-image'>
                          <img className='share-object' src={avatar(user)} alt={userId} width='40' height='40' />
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
                  {accept_shares.map(receiver => (
                      (receiver.share_all || receiver.topic_id) &&
                      <ul key={guid()} className='timeline timeline-horizontal'>
                        <li className='timeline-item'>
                          <div className='timeline-badge'>
                            <img className='share-object' src={avatar(user)} alt={userId} width='40' height='40' />
                          </div>
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
                                <span className={`tags tags-color-1`} rel='tag'>
                                  <span className='text-tag'>TOPIC: {(topics[receiver.topic_id] && topics[receiver.topic_id].term_name) || receiver.topic_id}</span>
                                </span>
                              </div>
                            </div>
                          }
                        </li>
                        <li className='timeline-item share-line-left'>
                          <div className='timeline-badge'>
                            <img className='object-badge' src={avatar(receiver)} alt={receiver.fullname} width='51' height='51' />
                          </div>
                          <div className='timeline-panel'>
                            <div className='timeline-panel'>
                              <span className='user-info-share'>{receiver.fullname}</span>
                              <a href='#' className='btn btn-related'>Unshare</a>
                            </div>

                          </div>
                        </li>
                      </ul>
                    ))}
                </div>
              </div>
            </div>
            {_.map(friendStreams, friend => (
              <div key={guid()} className='card card-topic'>
                <div className='card-header collapsed' role='tab' id={`heading${friend.user_id}`}  data-toggle='collapse' data-parent='#accordion' href={`#collapse${friend.user_id}`} aria-expanded='false' aria-controls={`collapse${friend.user_id}`}>
                  <div className='card-header-cnt'>
                    <div className='card-header-inner'>
                      <a className='collapse-title'>
                        <span className='directional-user'>
                          <span className='share-image'>
                            <img className='share-object' src={avatar(friend)} alt={friend.user_id} width='40' height='40' />
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
                    <span className='topic-value'>({friend.list.filter(item => shareLists[item].type === 'topic').length} topics)</span>
                  </div>
                </div>
                <div id={`collapse${friend.user_id}`} className='collapse' role='tabpanel' aria-labelledby={`heading${friend.user_id}`}>
                  <div className='card-block'>
                    {_.map(friend.list, item => (
                        shareLists[item].type !== 'url' &&
                        <ul key={guid()} className='timeline timeline-horizontal'>
                          <li className='timeline-item'>
                            <div className='timeline-badge'>
                              <img className='share-object' src={avatar(friend)} alt={friend.user_id} width='51' height='51' />
                            </div>
                            <div className='timeline-panel'>
                              <a href='#' className='btn btn-unfollow'>Unfollow</a>
                            </div>
                          </li>
                          <li className='timeline-item'>
                            <div className='timeline-badge'>
                              <i className={`fa ${shareLists[item].type === 'topic' ? 'fa-list' : 'fa-share-alt'}`} aria-hidden='true' />
                            </div>
                            {
                              shareLists[item].type === 'all' &&
                              <div className='timeline-panel'>
                                <span className='share-all'>All browsing history</span>
                              </div>
                            }
                            {
                              shareLists[item].topic_name &&
                              <div className='timeline-panel'>
                                <div className='tags-topic'>
                                  <span className='tags tags-color-1' rel='tag'>
                                    <span className='text-tag'>
                                      {shareLists[item].topic_name}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            }
                            {
                              shareLists[item].type === 'url' &&
                              <div className='timeline-panel'>
                                <span className='name-url'>{urls[shareLists[item].urls[0]].title}</span>
                              </div>
                            }
                          </li>
                          <li className='timeline-item share-line-left'>
                            <div className='timeline-badge'>
                              <img className='share-object' src={avatar(user)} alt={userId} width='51' height='51' />
                            </div>
                          </li>
                        </ul>
                      ))}
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
