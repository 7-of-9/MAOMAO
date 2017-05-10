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
    const options = {
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
        'name',
        'fullname',
        'title'
      ]
    }

    const sections = []
    const fuseUser = new Fuse(users, options)
    sections.push({
      title: 'User',
      data: fuseUser.search(value)
    })

    const fuseTopic = new Fuse(topics, options)
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
      <div>
        <img src={suggestion.avatar} />
        {suggestion.fullname}
      </div>
    )
  }

  renderInputComponent (inputProps) {
    return (
      <DebounceInput
        className='form-control'
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
      <strong>{section.title}</strong>
    )
  }

  onChange (event, { newValue }) {
    this.setState({
      value: newValue
    })
  }

  render () {
    const { value, suggestions } = this.state
    const { filterByTopic, filterByUser } = this.props
    const inputProps = {
      placeholder: 'Search...',
      value,
      onChange: this.onChange
    }
    logger.warn('value', value)
    logger.warn('suggestions', suggestions)
    logger.warn('filterByTopic', filterByTopic)
    logger.warn('filterByUser', filterByUser)

    return (
      <div className='input-group'>
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
        <div className='filter-rating'>
          <ReactStars
            count={5}
            value={this.props.rating}
            onChange={(selectValue) => { this.props.onChangeRate(selectValue) }}
            size={24}
            half={false}
            color2={'#ffd700'}
            />
        </div>
        <ul>
          {
            filterByTopic.map(item => (
              <li>{item.label} <a onClick={() => { this.props.onRemoveTopic(item) }}>Remove</a></li>
            ))
          }
          {
            filterByUser.map(item => (
              <li>
                <img src={item.avatar} alt={item.label} />
                {item.label} <a onClick={() => { this.props.onRemoveUser(item) }}>Remove</a>
              </li>
            ))
          }
        </ul>
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
  onRemoveTopic: PropTypes.func.isRequired,
  onRemoveUser: PropTypes.func.isRequired
}

export default FilterSearch
