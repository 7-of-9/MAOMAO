/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { compose, withState, withHandlers, onlyUpdateForKeys } from 'recompose'
import DebounceInput from 'react-debounce-input'
import _ from 'lodash'
import Form from './Form'
import logger from '../../utils/logger'
import { tagColor } from '../../utils/helper'

const enhance = compose(
  withState('value', 'changeValue', ''),
  withHandlers({
    onInput: (props) => (event) => {
      logger.warn('onInput', event)
      props.changeValue(event.target.value)
    },
    onSearch: (props) => (event) => {
      logger.warn('onSearch', event)
      if (event !== undefined && event.preventDefault) {
        event.preventDefault()
      }
      const tag = props.value
      props.terms.push(tag)
      props.changeValue('')
      props.onChange(props.terms)
    },
    handleAdd: (props) => (tag) => {
      props.terms.push(tag)
      props.onChange(props.terms)
    },
    handleDelete: (props) => (index) => {
      logger.warn('handleDelete', index, props.terms)
      props.terms.splice(index, 1)
      props.changeValue(props.terms.length)
      props.onChange(props.terms)
      props.changeValue('')
    }
  }),
  onlyUpdateForKeys(['terms', 'suggestions', 'value'])
)

const SearchBar = enhance(({ terms, suggestions, value, onInput, onSearch, handleAdd, handleDelete }) => {
  const inputProps = {
    placeholder: 'Search...',
    value,
    onChange: onInput
  }
  logger.warn('SearchBar', terms, suggestions, value)
  return (
    <Form onSubmit={onSearch}>
      <nav className='navbar'>
        <div className='nav navbar-nav' >
          <div id='toolbar-search' className='widget-form'>
            <div className='input-group'>
              <div className='input-group-suggest'>
                <div className='search-box-drop'>
                  <ul className='search-box-list'>
                    {
                      _.map(terms, (item, index) => (
                        <li className={tagColor(item)} key={`topic-${item}`}>
                          <span className='text-topic'>{item}</span>
                          <a className='btn-box-remove' onClick={() => { handleDelete(index) }}>
                            <i className='fa fa-remove' aria-hidden='true' />
                          </a>
                        </li>
                      ))
                    }
                  </ul>
                </div>
                <div className='react-autosuggest__container'>
                  <DebounceInput
                    className='react-autosuggest__input'
                    debounceTimeout={200}
                    {...inputProps}
                  />
                </div>
              </div>
            </div>
            {
              suggestions && suggestions.length > 0 &&
              <div className='suggestion-topic'>
                {_.map(suggestions, (item) => terms.indexOf(item) === -1 && (
                  <div key={`suggest-${item}`} className={`suggestion-topic-item ${tagColor(item)}`}>
                    <span className='text-topic'>{item}</span>
                    <a className='btn-box-remove' onClick={() => handleAdd(item)} ><i className='fa fa-plus' /></a>
                  </div>
              ))}
              </div>
            }
          </div>
        </div>
      </nav>
    </Form>
  )
})

SearchBar.propTypes = {
  onChange: PropTypes.func.isRequired,
  terms: PropTypes.array.isRequired,
  suggestions: PropTypes.array,
  value: PropTypes.string
}

export default SearchBar
