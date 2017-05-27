/**
*
* ShareList
*
*/

import React from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import logger from '../../utils/logger'

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
    const { users, topics } = toJS(this.props.store)
    logger.warn('users, topics', users, topics)
    return (
      <div className='share-modal-content'>
        <div className='modal-header'>
          <h4 className='modal-title'>Share management</h4>
        </div>
        <div className='modal-body'>
          <div id='accordion' role='tablist' aria-multiselectable='true'>
            <div className='card card-topic'>
              <div className='card-header' role='tab' id='headingOne' data-toggle='collapse' data-parent='#accordion' href='#collapseOne' aria-expanded='true' aria-controls='collapseOne'>
                <div className='directional-user'>
                  <div className='share-image'>
                    <a href='#'><img className='share-object' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='40' height='40' /></a>
                  </div>
                  <div className='share-name'> Huỳnh Đức Dũng</div>
                </div>
              </div>
              <div id='collapseOne' className='collapse show' role='tabpanel' aria-labelledby='headingOne'>
                <div className='card-block'>
                  <ul className='timeline timeline-horizontal'>
                    <li className='timeline-item'>
                      <div className='timeline-badge'>
                        <a href='#'>
                          <img className='object-badge' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='51' height='51' />
                        </a>
                      </div>
                      <div className='timeline-panel'>
                        <a href='#' className='btn btn-related'>Unshare</a>
                      </div>
                    </li>
                    <li className='timeline-item'>
                      <div className='timeline-badge'>
                        <i className='fa fa-share-alt' aria-hidden='true' />
                      </div>
                      <div className='timeline-panel'>
                        <span className='name-url'>github.com</span>
                      </div>
                    </li>
                    <li className='timeline-item share-line-left'>
                      <div className='timeline-badge'>
                        <a href='#'>
                          <img className='object-badge' src='https://lh4.googleusercontent.com/-ZkXKKEWALHg/AAAAAAAAAAI/AAAAAAAAATI/3U8fKfpcXqs/photo.jpg' alt='' width='51' height='51' />
                        </a>
                      </div>
                      <div className='timeline-panel'>
                        <a href='#' className='btn btn-unfollow'>Unfollow</a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='card card-topic'>
              <div className='card-header' role='tab' id='headingOne' data-toggle='collapse' data-parent='#accordion' href='#collapseOne' aria-expanded='true' aria-controls='collapseOne'>
                <div className='directional-user'>
                  <div className='share-image'>
                    <a href='#'><img className='share-object' src='https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/14702240_10207386391686714_2875182266540735639_n.jpg?oh=3fe0b8f61f0774ca75120127cd640154&oe=5957A4E8' alt='' width='40' height='40' /></a>
                  </div>
                  <div className='share-name'> Dominic Morris</div>
                </div>
              </div>
              <div id='collapseTwo' className='collapse show' role='tabpanel' aria-labelledby='headingTwo'>
                <div className='card-block'>
                  <ul className='timeline timeline-horizontal'>
                    <li className='timeline-item share-line-right'>
                      <div className='timeline-badge'>
                        <a href='#'>
                          <img className='object-badge' src='https://scontent.xx.fbcdn.net/v/t1.0-1/s100x100/14702240_10207386391686714_2875182266540735639_n.jpg?oh=3fe0b8f61f0774ca75120127cd640154&oe=5957A4E8' alt='' width='51' height='51' />
                        </a>
                      </div>
                      <div className='timeline-panel'>
                        <a href='#' className='btn btn-related'>Unshare</a>
                      </div>
                    </li>
                    <li className='timeline-item'>
                      <div className='timeline-badge'>
                        <i className='fa fa-list' aria-hidden='true' />
                      </div>
                      <div className='timeline-panel'>
                        <div className='tags-topic'>
                          <span className='tags tags-color-7' rel='tag'>
                            <span className='text-tag'>University of California, Berkeley</span>
                          </span>
                        </div>
                      </div>
                    </li>
                    <li className='timeline-item'>
                      <div className='timeline-badge'>
                        <a href='#'>
                          <img className='object-badge' src='https://lh6.googleusercontent.com/-WLGCOsPN58Q/AAAAAAAAAAI/AAAAAAAAABc/pJzt8KW6Pxg/photo.jpg' alt='' width='51' height='51' />
                        </a>
                      </div>
                      <div className='timeline-panel'>
                        <a href='#' className='btn btn-unfollow'>Unfollow</a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ShareList
