/**
*
* ShareWithFriends
*
*/

import React from 'react';
import styled from 'styled-components';
import { WithContext as ReactTags } from 'react-tag-input';

const Wrapper = styled.div`
  float: left;
  margin-right: 10px;
`;

const ShareWith = styled.button`
  float: left;
  padding: 0.75em;
  backgroundColor: #d14836;
  color: #fff;
  margin-right: 10px;
`;

const YourFriends = styled.div`
  float: left;
  margin-right: 40px;
`;


function ShareWithFriends({ friends }) {
  return (
    <Wrapper>
      <ShareWith>Share with</ShareWith>
      <YourFriends>
        <ReactTags
          placeholder={'Invite your friends'}
          tags={friends}
          labelField={'name'}
          autofocus={false}
        />
      </YourFriends>
    </Wrapper>
  );
}

ShareWithFriends.propTypes = {
  friends: React.PropTypes.array,
};

export default ShareWithFriends;
