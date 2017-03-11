/**
*
* FriendStream
*
*/

import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 1em;
  margin: 0 auto;
  text-align: center;
`;

const Title = styled.h3`
  padding: 1em;
  color: #7d7b6f;
`;

const BoldText = styled.span`
  font-weight: bolder;
  font-size: 120%;
  color: #000;
`;

function FriendStream({ name, topic }) {
  return (
    <Wrapper>
      <Title>{name} wants to share with you: <br /><BoldText>{'"'}{topic}{'"'}</BoldText></Title>
    </Wrapper>
  );
}

FriendStream.propTypes = {
  name: React.PropTypes.string,
  topic: React.PropTypes.string,
};

export default FriendStream;
