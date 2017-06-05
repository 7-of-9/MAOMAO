/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import { compose, withState, withHandlers, onlyUpdateForKeys, lifecycle } from 'recompose'
import DebounceInput from 'react-debounce-input'
import Form from './Form'
import { guid } from '../../utils/hash'
import logger from '../../utils/logger'

const MAX_COLORS = 12

const SearchBar = ({ tags, value, onInput, onSearch, handleDelete }) => {
  logger.warn('SearchBar tags', tags)
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
                <DebounceInput
                  className='search-box-list'
                  minLength={2}
                  debounceTimeout={200}
                  {...inputProps}
                />
                <div className='search-box-drop'>
                  <ul className='search-box-list'>
                    {
                      tags.map((item, index) => (
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
              </div>
            </div>
          </div>
        </div>
      </nav>
    </Form>
  )
}

SearchBar.propTypes = {
  onChange: PropTypes.func.isRequired,
  terms: PropTypes.array.isRequired,
  handleDelete: PropTypes.func,
  handleAddition: PropTypes.func,
  changeTags: PropTypes.func
}

const enhance = compose(
  withState('tags', 'updateTags', []),
  withState('value', 'changeValue', ''),
  withHandlers({
    onInput: (props) => (event) => {
      logger.warn('onInput', event)
      props.changeValue(event.target.value)
    },
    onSearch: (props) => (event) => {
      logger.warn('onSearch', event)
      const tag = props.value
      props.tags.push(tag)
      props.updateTags(props.tags)
      props.onChange(props.tags)
      props.changeValue('')
    },
    changeTags: (props) => (newTags) => {
      logger.warn('changeTags', newTags)
      props.updateTags(newTags)
    },
    handleDelete: (props) => (index) => {
      logger.warn('handleDelete', index, props.tags)
      const tags = props.tags.splice(index, 1)
      props.onChange(tags)
      props.updateTags(tags)
    }
  }),
  lifecycle({
    componentDidMount () {
      if (this.props.terms.length > 0 && this.props.tags.length === 0) {
        this.props.changeTags(this.props.terms)
      }
    }
  }),
  onlyUpdateForKeys(['terms', 'tags'])
)

export default enhance(SearchBar)
