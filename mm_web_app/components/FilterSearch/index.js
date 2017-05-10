/**
*
* FriendStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
import ReactStars from 'react-stars'
import DebounceInput from 'react-debounce-input'
import logger from '../../utils/logger'

function escapeRegexCharacters (str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

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
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length
    const escapedValue = escapeRegexCharacters(value.trim())

    if (escapedValue === '' || inputLength === 0) {
      return []
    }
    const { users, topics } = this.state

    const regex = new RegExp('^' + escapedValue, 'i')
    const sections = []

    sections.push({
      title: 'User',
      data: users.filter(user => regex.test(user.fullname))
    })

    sections.push({
      title: 'Stream',
      data: topics.filter(topic => regex.test(topic.name))
    })

    return sections.filter(section => section.data.length > 0)
  }

  getSectionSuggestions (section) {
    return section.data
  }

  getSuggestionValue (suggestion) {
    return suggestion.name || suggestion.fullname
  }

  renderSuggestion (suggestion) {
    if (suggestion.name) {
      return (<div>
        {suggestion.name}
      </div>)
    }
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
        debounceTimeout={300}
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
    const inputProps = {
      placeholder: 'Search...',
      value,
      onChange: this.onChange
    }
    logger.warn('value', value)
    logger.warn('suggestions', suggestions)

    return (
      <div className='input-group'>
        <Autosuggest
          multiSection
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
      </div>
    )
  }
}

FilterSearch.propTypes = {
  urls: PropTypes.array.isRequired,
  topics: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  rating: PropTypes.number.isRequired,
  onChangeRate: PropTypes.func.isRequired
}

export default FilterSearch
