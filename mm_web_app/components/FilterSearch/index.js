/**
*
* FriendStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import Autosuggest from 'react-autosuggest'
import ReactStars from 'react-stars'
import DebounceInput from 'react-debounce-input'
import logger from '../../utils/logger'
import { guid } from '../../utils/hash'

const MAX_COLORS = 12

class FilterSearch extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      suggestions: [],
      value: ''
    }
    this.onChange = this.onChange.bind(this)
    this.renderSuggestion = this.renderSuggestion.bind(this)
    this.getSectionSuggestions = this.getSectionSuggestions.bind(this)
    this.renderInputComponent = this.renderInputComponent.bind(this)
    this.renderSectionTitle = this.renderSectionTitle.bind(this)
    this.getSuggestions = this.getSuggestions.bind(this)
    this.getSuggestionValue = this.getSuggestionValue.bind(this)
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this)
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this)
  }

  getSuggestions (value) {
    if (value === '' || value.length === 0) {
      return []
    }

    const { users, topics } = this.props
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

  getSectionSuggestions (section) {
    return section.data
  }

  getSuggestionValue (suggestion) {
    return suggestion.name || suggestion.fullname || suggestion.title
  }

  renderSuggestion (suggestion) {
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

  renderInputComponent (inputProps) {
    return (
      <DebounceInput
        className='search-box-list'
        minLength={2}
        debounceTimeout={200}
        {...inputProps}
        />
    )
  }

  onSuggestionsFetchRequested ({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value)
    })
  }

  onSuggestionsClearRequested () {
    this.setState({
      suggestions: []
    })
  }

  renderSectionTitle (section) {
    return (
      <p className='search-box-title'>{section.title}</p>
    )
  }

  onChange (event, { newValue, method }) {
    if (method === 'click' || method === 'enter') {
      const selected = this.getSuggestions(newValue)
      logger.warn('selected', selected)
      if (selected && selected.length > 0) {
        if (selected[0].title === 'User') {
          this.props.onSelectUser(selected[0].data[0])
        } else {
          this.props.onSelectTopic(selected[0].data[0])
        }
      }
      this.setState({
        value: ''
      })
    } else {
      this.setState({
        value: newValue
      })
    }
  }

  render () {
    const { value, suggestions } = this.state
    const { filterByTopic, filterByUser } = this.props
    const inputProps = {
      placeholder: 'Search...',
      value,
      onChange: this.onChange
    }

    return (
      <div className='input-group'>
        <div className='input-group-suggest'>
          <div className='filter-rating'>
            <ReactStars
              count={5}
              value={this.props.rating}
              onChange={this.props.onChangeRate}
              size={24}
              half={false}
              color2={'#ffd700'}
              />
          </div>
          <div className='search-box-drop'>
            <ul className='search-box-list'>
              {
                filterByTopic.map(item => (
                  <li className={`tags-color-${(filterByTopic.indexOf(item) % MAX_COLORS) + 1}`} key={guid()}>
                    <span className='text-topic'>{item.label}</span>
                    <a className='btn-box-remove' onClick={() => { this.props.onRemoveTopic(item) }}>
                      <i className='fa fa-remove' aria-hidden='true' />
                    </a>
                  </li>
                ))
              }
              {
                filterByUser.map(item => (
                  <li key={guid()} className='search-item'>
                    <div className='search-media'>
                      <div className='search-media-left'>
                        <img src={item.avatar || '/static/images/no-image.png'} alt={item.label} className='img-object' width='40' height='40' />
                      </div>
                      <div className='search-media-body'>
                        <span className='full-name'>{item.label}</span>
                        <a className='btn-box-remove' onClick={() => { this.props.onRemoveUser(item) }}>
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
            getSuggestionValue={this.getSuggestionValue}
            getSectionSuggestions={this.getSectionSuggestions}
            renderSectionTitle={this.renderSectionTitle}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
            renderInputComponent={this.renderInputComponent}
          />
        </div>
      </div>
    )
  }
}

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
