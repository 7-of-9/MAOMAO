/**
*
* FriendStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import Fuse from 'fuse.js'
import Autosuggest from 'react-autosuggest'
import DebounceInput from 'react-debounce-input'
import logger from '../../utils/logger'

const MAX_COLORS = 12

const avatar = (user) => {
  if (user && (user.picture || user.avatar)) {
    return user.picture || user.avatar
  }
  return '/static/images/no-avatar.png'
}

const getSuggestions = (value, users, firstLevelTopics) => {
  if (value === '' || value.length === 0) {
    return []
  }

  const userOptions = {
    include: ['matches', 'score'],
    shouldSort: true,
    tokenize: true,
    matchAllTokens: true,
    findAllMatches: true,
    threshold: 0.1,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'fullname'
    ]
  }

  const sections = []
  const fuseUser = new Fuse(users, userOptions)
  sections.push({
    title: 'User',
    data: fuseUser.search(value)
  })

  const topicOtions = {
    include: ['matches', 'score'],
    shouldSort: true,
    tokenize: true,
    matchAllTokens: true,
    findAllMatches: true,
    threshold: 0.1,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'name'
    ]
  }
  const fuseTopic = new Fuse(firstLevelTopics, topicOtions)
  sections.push({
    title: 'Stream',
    data: fuseTopic.search(value)
  })

  return sections.filter(section => section.data.length > 0)
}

const getSectionSuggestions = (section) => {
  return section.data
}

const getSuggestionValue = (suggestion) => {
  return suggestion.name || suggestion.fullname || suggestion.title
}

const renderSuggestion = (suggestion) => {
  if (suggestion.name) {
    return (<div>
      {suggestion.name}
    </div>)
  }
  return (
    <div className='search-media'>
      <div className='search-media-left'><img src={suggestion.avatar} className='img-object' alt='' width='40' height='40' /></div>
      <div className='search-media-body'><span className='full-name'>{suggestion.fullname}</span></div>
    </div>
  )
}

const renderInputComponent = (inputProps) => {
  return (
    <DebounceInput
      className='search-box-list'
      minLength={2}
      debounceTimeout={200}
      {...inputProps}
      />
  )
}

const renderSectionTitle = (section) => {
  return (
    <p className='search-box-title'>{section.title}</p>
  )
}

const ratingCount = (urls, owners, rate) => {
  return 0
}

@inject('store')
@inject('ui')
@observer
class FilterSearch extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      suggestions: []
    }
    this.onChange = this.onChange.bind(this)
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this)
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this)
  }

  onSuggestionsFetchRequested ({ value }) {
    logger.warn('onSuggestionsFetchRequested')
    const { users, firstLevelTopics } = this.props.store
    this.setState({ suggestions: getSuggestions(value, users, firstLevelTopics) })
  }

  onSuggestionsClearRequested () {
    logger.warn('onSuggestionsClearRequested')
    this.setState({suggestions: [ ]})
  }

  onChange (event, { newValue, method }) {
    logger.warn('onChange newValue, method', newValue, method)
    if (method === 'click' || method === 'enter') {
      const { users, firstLevelTopics } = this.props.store
      const selected = getSuggestions(newValue, users, firstLevelTopics)
      logger.warn('selected', selected)
      if (selected && selected.length > 0) {
        if (selected[0].title === 'User') {
          this.props.ui.selectUser(selected[0].data[0])
        } else {
          this.props.ui.selectTopic(selected[0].data[0])
        }
        this.setState({
          value: ''
        })
      }
    } else {
      this.setState({
        value: newValue
      })
    }
  }

  render () {
    const { value, suggestions } = this.state
    const { sortedUrls, owners } = this.props
    const inputProps = {
      placeholder: 'Search...',
      value,
      onChange: this.onChange
    }
    const { users, firstLevelTopics, userId } = toJS(this.props.store)
    const { filterByTopic, filterByUser, rating, sortBy, sortDirection, onlyMe } = this.props.ui
    logger.warn('FilterSearch render', users, firstLevelTopics, userId)

    return (
      <nav className='navbar'>
        <div className='nav navbar-nav' >
          <div className='switch-responsive'>
            <div className='switch-item'>
              <div className='checkbox__styled'>
                <input onChange={() => this.props.ui.toggleOnlyMe(userId, users)} type='checkbox' className='checkbox__styled__input' id='checkbox-mobile-only-me' name='only-me-mobile' value={userId} checked={onlyMe} />
                <label className='checkbox__styled__label' htmlFor='checkbox-mobile-only-me'>Only me</label>
              </div>
            </div>
            <div className='switch-item'>
              <button className='btn btn-search navbar-toggler' type='button' data-toggle='collapse' data-target='#toolbar-search' aria-expanded='true'>
                <i className='fa fa-search' />
              </button>
            </div>
            <div className='switch-item'>
              <button className='btn btn-navicon navbar-toggler collapsed' type='button' data-toggle='collapse' data-target='#toolbar-sort' aria-expanded='false'>
                <i className='fa fa-gear' />
              </button>
            </div>
          </div>
          <div id='toolbar-search' className='widget-form collapse-show collapse show' aria-expanded='true'>
            <div className='checkbox__styled'>
              <input onChange={() => this.props.ui.toggleOnlyMe(userId, users)} type='checkbox' className='checkbox__styled__input' id='checkbox-only-me' name='only-me' value={userId} checked={onlyMe} />
              <label className='checkbox__styled__label' htmlFor='checkbox-only-me'>Only me</label>
            </div>
            <div className='input-group'>
              <div className='input-group-suggest'>
                <div className='search-box-drop'>
                  <ul className='search-box-list'>
                    {
                      filterByTopic.map(item => (
                        <li className={`tags-color-${(firstLevelTopics.map(item => item.name).indexOf(item.label) % MAX_COLORS) + 1}`} key={`filter-topic-${item.label}`}>
                          <span className='text-topic'>{item.label}</span>
                          <a className='btn-box-remove' onClick={() => { this.props.ui.removeTopic(item) }}>
                            <i className='fa fa-remove' aria-hidden='true' />
                          </a>
                        </li>
                      ))
                    }
                    {
                    filterByUser.map(item => (
                      <li key={`filter-user-${item.label}`} className='search-item tags-color-1'>
                        <div className='search-media'>
                          <div className='search-media-left'>
                            <img src={item.avatar || '/static/images/no-image.png'} alt={item.label} className='img-object' width='40' height='40' />
                          </div>
                          <div className='search-media-body'>
                            <span className='full-name'>{item.label}</span>
                            <a className='btn-box-remove' onClick={() => { this.props.ui.removeUser(item) }}>
                              <i className='fa fa-remove' aria-hidden='true' />
                            </a>
                          </div>
                        </div>
                      </li>
                    ))
                  }
                  </ul>
                </div>
                <Autosuggest
                  multiSection
                  highlightFirstSuggestion
                  focusInputOnSuggestionClick={false}
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                  getSuggestionValue={getSuggestionValue}
                  getSectionSuggestions={getSectionSuggestions}
                  renderSectionTitle={renderSectionTitle}
                  renderSuggestion={renderSuggestion}
                  inputProps={inputProps}
                  renderInputComponent={renderInputComponent}
                />
              </div>
            </div>

          </div>
          <div id='toolbar-sort' className='widget-row collapse' aria-expanded='false'>
            <div className='widget-dropdown'>
              <div className='widget-topic'>
                <a data-toggle='dropdown'>
                  <span className='nav-symbol'><i className='fa fa-list fa-2x' aria-hidden='true' /></span>
                  <span className='nav-text'>List Streams</span>
                </a>
                <ul className='dropdown-menu'>
                  {firstLevelTopics.map(topic => (
                    <li key={`topic-${topic.name}`} onClick={() => this.props.ui.selectTopic(topic)}>
                      <span className='topic-name'><i className='fa fa-angle-right' aria-hidden='true' /> {topic.name}</span>
                    </li>
                ))}
                </ul>
              </div>
            </div>
            <div className='widget-dropdown'>
              <div className='widget-user'>
                <a data-toggle='dropdown'>
                  <span className='nav-symbol'><i className='fa fa-users fa-2x' aria-hidden='true' /></span>
                  <span className='nav-text'>List Users</span>
                </a>
                <ul className='dropdown-menu'>
                  {users.map(user =>
                  (<li onClick={() => this.props.ui.selectUser(user)} key={`user-${user.user_id}`}>
                    <div className='user-share'>
                      <div className='user-share-img'>
                        <img width='24' height='24' src={avatar(user)} alt={user.fullname} />
                      </div>
                      <div className='user-share-cnt'>
                        <div className='user-share-inner'>
                          <p className='user-info'>
                            <span className='share-fullname'>{user.fullname}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='widget-dropdown'>
              <div className={sortBy === 'date' ? 'widget-calendar active' : 'widget-calendar'}>
                <a onClick={() => this.props.ui.changeSortOrder('date', sortDirection === 'asc' ? 'desc' : 'asc')}>
                  <span className='nav-symbol'>
                    <i className='fa fa-calendar fa-2x' aria-hidden='true' />
                  </span>
                  <span className='nav-text'>Order by date</span>
                </a>
                <span className='order-calendar'>
                  <a
                    className={sortBy === 'date' && sortDirection === 'asc' ? 'order-asc active' : 'order-asc'}
                    onClick={() => this.props.ui.changeSortOrder('date', 'asc')}
                  >
                    <i className='fa fa-sort-up' aria-hidden='true' />
                  </a>
                  <a
                    className={sortBy === 'date' && sortDirection === 'desc' ? 'order-desc active' : 'order-desc'}
                    onClick={() => this.props.ui.changeSortOrder('date', 'desc')}
                  >
                    <i className='fa fa-sort-desc' aria-hidden='true' />
                  </a>
                </span>
              </div>
            </div>
            <div className='widget-dropdown'>
              <div className={sortBy === 'rating' ? 'widget-user active' : 'widget-user'}>
                <a data-toggle='dropdown'>
                  <span className='nav-symbol'><i className='fa fa-signal fa-2x' aria-hidden='true' /></span>
                  <span className='nav-text'>Rating</span>
                </a>
                <span className='order-rating'>
                  <a
                    className={sortBy === 'rating' && sortDirection === 'asc' ? 'order-asc active' : 'order-asc'}
                    onClick={() => this.props.ui.changeSortOrder('rating', 'asc')}
                                ><i className='fa fa-sort-up' aria-hidden='true' />
                  </a>
                  <a
                    className={sortBy === 'rating' && sortDirection === 'desc' ? 'order-desc active' : 'order-desc'}
                    onClick={() => this.props.ui.changeSortOrder('rating', 'desc')}
                                >
                    <i className='fa fa-sort-desc' aria-hidden='true' />
                  </a>
                </span>
                <ul className='dropdown-menu sort-case'>
                  {
                    [
                      { rate: 1, label: 'Low' },
                      { rate: 2, label: 'Poor' },
                      { rate: 3, label: 'Average' },
                      { rate: 4, label: 'Good' },
                      { rate: 5, label: 'Excellent' }
                    ].map((item) => (
                      <li onClick={() => this.props.ui.changeRate(item.rate)} className={item.rate >= rating ? 'sort-case-item active' : 'sort-case-item'} key={`rating-label-${item.label}`}>
                        <a className='filter-rating'>
                          {
                            [1, 2, 3, 4, 5].map((star) => (
                              <span className={star <= item.rate ? 'active' : ''} key={`rating-start-${star}`} />
                            ))
                          }
                        </a>
                        <div className='rating-number'>
                          <span className='label-priority'>{item.label}</span>
                          <div className='label-rating-number'>{ratingCount(sortedUrls, owners, item.rate)}</div>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

FilterSearch.propTypes = {
  sortedUrls: PropTypes.array.isRequired,
  owners: PropTypes.array.isRequired
}

export default FilterSearch
