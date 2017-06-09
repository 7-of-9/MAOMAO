/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { compose, withState, withHandlers } from 'recompose'
import DebounceInput from 'react-debounce-input'
import Form from './Form'
import { guid } from '../../utils/hash'
import logger from '../../utils/logger'

const MAX_COLORS = 12

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
    handleDelete: (props) => (index) => {
      logger.warn('handleDelete', index, props.terms)
      props.terms.splice(index, 1)
      props.changeValue(props.terms.length)
      props.onChange(props.terms)
      props.changeValue('')
    }
  })
)

const SearchBar = enhance(({ terms, value, onInput, onSearch, handleDelete }) => {
  logger.warn('SearchBar render', terms, value)
  const inputProps = {
    placeholder: 'Search...',
    value,
    onChange: onInput
  }
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
                      terms.map((item, index) => (
                        <li className={`tags-color-${(index % MAX_COLORS) + 1}`} key={guid()}>
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
            {/*
            <div className='suggestion-topic'>
              <div className='suggestion-topic-item tags-color-1'>
                <span className='text-topic'>Computing</span>
                <a className='btn-box-remove'><i className='fa fa-remove' /></a>
              </div>
              <div className='suggestion-topic-item tags-color-2'>
                <span className='text-topic'>Javascript</span>
                <a className='btn-box-remove'><i className='fa fa-remove' /></a>
              </div>
              <div className='suggestion-topic-item tags-color-3'>
                <span className='text-topic'>Technology</span>
                <a className='btn-box-remove'><i className='fa fa-remove' /></a>
              </div>
            </div>
            */}
          </div>
        </div>
      </nav>
    </Form>
  )
})

SearchBar.propTypes = {
  onChange: PropTypes.func.isRequired,
  terms: PropTypes.array.isRequired,
  value: PropTypes.string
}

export default SearchBar
