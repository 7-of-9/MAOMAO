/**
*
* SearchBar
*
*/

import React, { PropTypes } from 'react'
import { compose, withState, withHandlers, onlyUpdateForKeys } from 'recompose'
import { WithContext as ReactTags } from 'react-tag-input'
import * as logger from 'loglevel'
import Form from './Form'
import A from './A'
import { InputWrapper, InputContainer } from './Input'

const TEST_SET_1 = ['Classical music', 'Musical', 'Musical compositions', 'Musical history', '1840s', 'Arts']
const TEST_SET_2 = ['Hanna-Barbera', 'Warner Bros', 'Cartoon Network', 'Rivalry', 'Anthropomorphism']
const TEST_SET_3 = ['Chess', 'Traditional games', 'Games', 'Board games', 'Game theory']
const TEST_SET_4 = ['Human sexuality', 'Auctions', 'Human reproduction', 'Sex', 'Human behavior']

const SearchBar = ({ tags, onSearch, changeTags, handleDelete, handleAddition }) => (
  <Form onSubmit={onSearch}>
    <A onClick={() => { changeTags(TEST_SET_1) }} > Test Set 1 </A> |
      <A onClick={() => { changeTags(TEST_SET_2) }} > Test Set 2 </A> |
      <A onClick={() => { changeTags(TEST_SET_3) }} > Test Set 3 </A> |
      <A onClick={() => { changeTags(TEST_SET_4) }} > Test Set 4 </A> |
      <InputWrapper>
        <InputContainer>
          <ReactTags
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
      logger.info('changeTags', newTags)
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
      logger.info('handleDelete', index)
      props.updateTags((tags) => {
        tags.splice(index, 1)
        const selectedTags = tags.map((item) => item.text)
        props.onChange(selectedTags)
        return tags
      })
    },
    handleAddition: (props) => (tag) => {
      logger.info('handleAddition', tag)
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
  onlyUpdateForKeys(['terms'])
)

export default enhance(SearchBar)
