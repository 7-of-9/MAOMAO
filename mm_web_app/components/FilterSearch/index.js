/**
*
* FriendStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { compose, withHandlers, withState, onlyUpdateForKeys } from 'recompose'
import Fuse from 'fuse.js'
import Autosuggest from 'react-autosuggest'
import ReactStars from 'react-stars'
import DebounceInput from 'react-debounce-input'
import logger from '../../utils/logger'
import { guid } from '../../utils/hash'

const MAX_COLORS = 12

const getSuggestions = (value, users, topics) => {
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
  const fuseTopic = new Fuse(topics, topicOtions)
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
      /* topic html */
    return (<div>
      {suggestion.name}
    </div>)
  }
    /* user html */
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

const enhance = compose(
  withState('suggestions', 'changeSuggestions', []),
  withState('value', 'changeValue', ''),
  withHandlers({
    onSuggestionsFetchRequested: props => ({ value }) => {
      props.changeSuggestions(getSuggestions(value, props.users, props.topics))
    },
    onSuggestionsClearRequested: props => () => {
      props.changeSuggestions([])
    },
    onChange: props => (event, { newValue, method }) => {
      logger.warn('newValue, method', newValue, method)
      if (method === 'click' || method === 'enter') {
        const selected = getSuggestions(newValue, props.users, props.topics)
        logger.warn('selected', selected)
        if (selected && selected.length > 0) {
          if (selected[0].title === 'User') {
            props.onSelectUser(selected[0].data[0])
          } else {
            props.onSelectTopic(selected[0].data[0])
          }
          props.changeValue('')
        }
      } else {
        props.changeValue(newValue)
      }
    }
  }),
  onlyUpdateForKeys([ 'value', 'suggestions', 'rating', 'filterByTopic', 'filterByUser' ])
)

const FilterSearch = enhance(({
  value, rating, suggestions, filterByTopic, filterByUser, topics,
  onSuggestionsFetchRequested, onSuggestionsClearRequested,
  onChange, onChangeRate, onRemoveTopic, onRemoveUser
}) => {
  const inputProps = {
    placeholder: 'Search...',
    value,
    onChange: onChange
  }
  return (
    <div className='input-group'>
      <div className='input-group-suggest'>
        <div className='search-box-drop'>
          <ul className='search-box-list'>
            {
                filterByTopic.map(item => (
                  <li className={`tags-color-${(topics.map(item => item.name).indexOf(item.label) % MAX_COLORS) + 1}`} key={guid()}>
                    <span className='text-topic'>{item.label}</span>
                    <a className='btn-box-remove' onClick={() => { onRemoveTopic(item) }}>
                      <i className='fa fa-remove' aria-hidden='true' />
                    </a>
                  </li>
                ))
              }
            {
                filterByUser.map(item => (
                  <li key={guid()} className='search-item tags-color-1'>
                    <div className='search-media'>
                      <div className='search-media-left'>
                        <img src={item.avatar || '/static/images/no-image.png'} alt={item.label} className='img-object' width='40' height='40' />
                      </div>
                      <div className='search-media-body'>
                        <span className='full-name'>{item.label}</span>
                        <a className='btn-box-remove' onClick={() => { onRemoveUser(item) }}>
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
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          getSectionSuggestions={getSectionSuggestions}
          renderSectionTitle={renderSectionTitle}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          renderInputComponent={renderInputComponent}
          />
      </div>
      <div className='filter-rating'>
        {/*<ReactStars
          count={5}
          value={rating}
          onChange={onChangeRate}
          size={24}
          half={false}
          color2={'#ffd700'}
            />*/}
            <span className='active' />
            <span className='active' />
            <span className='active' />
            <span />
            <span />
      </div>
      <div className='rating-number'>
        <span className='label-rating-number'>7</span>
      </div>
    </div>
  )
})

FilterSearch.propTypes = {
  urls: PropTypes.array.isRequired,
  topics: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  filterByTopic: PropTypes.array.isRequired,
  filterByUser: PropTypes.array.isRequired,
  rating: PropTypes.number.isRequired,
  onChangeRate: PropTypes.func.isRequired,
  onSelectTopic: PropTypes.func.isRequired,
  onRemoveTopic: PropTypes.func.isRequired,
  onSelectUser: PropTypes.func.isRequired,
  onRemoveUser: PropTypes.func.isRequired
}

export default FilterSearch
