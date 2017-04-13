/**
*
* ShareWithFriends
*
*/

import React from 'react'
import styled from 'styled-components'
import { WithContext as ReactTags } from 'react-tag-input'

const Wrapper = styled.div`
  float: left;
  margin-right: 10px;
`

const ShareWith = styled.button`
  float: left;
  padding: 0.75em;
  backgroundColor: #0b9803;
  color: #fff;
  margin-right: 10px;
  border: 2px solid #000;
`

const YourFriends = styled.div`
  float: left;
`

const Description = styled.p`
  width: 90px;
  float: left;
  line-height: 15px;
`

function ShareWithFriends ({ friends }) {
  return (
    <Wrapper>
      <ShareWith>Share ...</ShareWith>
      <YourFriends>
        <Description>Share with:</Description>
        <ReactTags
          placeholder={''}
          tags={friends}
          labelField={'name'}
          autofocus={false}
          handleDelete={() => {}}
          handleAddition={() => {}}
        />
      </YourFriends>
    </Wrapper>
  )
}

ShareWithFriends.propTypes = {
  friends: React.PropTypes.array
}

export default ShareWithFriends
