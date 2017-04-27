/**
*
* SearchBar
*
*/

import React, { PropTypes } from 'react'
import { compose, withState, withHandlers, onlyUpdateForKeys, lifecycle } from 'recompose'
import { WithContext as ReactTags } from 'react-tag-input'
import Form from './Form'
import A from './A'
import { InputWrapper, InputContainer } from './Input'

const TEST_SET_1 = ['Classical music', 'Musical', 'Musical compositions', 'Musical history', '1840s', 'Arts']
const TEST_SET_2 = ['Hanna-Barbera', 'Warner Bros', 'Cartoon Network', 'Rivalry', 'Anthropomorphism']
const TEST_SET_3 = ['Chess', 'Traditional games', 'Games', 'Board games', 'Game theory']
const TEST_SET_4 = ['Human sexuality', 'Auctions', 'Human reproduction', 'Sex', 'Human behavior']

const SearchBar = ({ tags, onSearch, changeTags, handleDelete, handleAddition }) => (
  <Form onSubmit={onSearch}>
    <div className='stream-list'>
      <A className='stream-item' onClick={() => { changeTags(TEST_SET_1) }} > <span>Test Set 1</span> </A> |
        <A className='stream-item' onClick={() => { changeTags(TEST_SET_2) }} > <span>Test Set 2</span> </A> |
        <A className='stream-item' onClick={() => { changeTags(TEST_SET_3) }} > <span>Test Set 3</span> </A> |
        <A className='stream-item' onClick={() => { changeTags(TEST_SET_4) }} > <span>Test Set 4</span> </A> |
      </div>
    <InputWrapper className='search-bar'>
      <InputContainer>
        <ReactTags
          className='form-control'
          tags={tags}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          placeholder='Search:'
          />
      </InputContainer>
    </InputWrapper>
  </Form>
  )

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  terms: PropTypes.array.isRequired,
  handleDelete: PropTypes.func,
  handleAddition: PropTypes.func,
  changeTags: PropTypes.func
}

const enhance = compose(
  withState('tags', 'updateTags', []),
  withHandlers({
    changeTags: (props) => (newTags) => {
      props.updateTags(() => {
        const tags = []
        for (let counter = 0; counter < newTags.length; counter += 1) {
          tags.push({
            id: counter + 1,
            text: newTags[counter]
          })
        }
        const selectedTags = tags.map((item) => item.text)
        props.onChange(selectedTags)
        return tags
      })
    },
    handleDelete: (props) => (index) => {
      props.updateTags((tags) => {
        tags.splice(index, 1)
        const selectedTags = tags.map((item) => item.text)
        props.onChange(selectedTags)
        return tags
      })
    },
    handleAddition: (props) => (tag) => {
      props.updateTags((tags) => {
        tags.push({
          id: tags.length + 1,
          text: tag
        })
        const selectedTags = tags.map((item) => item.text)
        props.onChange(selectedTags)
        return tags
      })
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
