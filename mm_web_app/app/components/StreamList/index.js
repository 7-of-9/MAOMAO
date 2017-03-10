/**
*
* StreamList
*
*/

import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  float: right;
  width: 80%;
  padding: 1em;
  backgroundColor: #cacaca;
`;

function StreamList({ children }) {
  return (
    <Wrapper>
      {React.Children.toArray(children)}
    </Wrapper>
  );
}

StreamList.propTypes = {
  children: React.PropTypes.node,
};

export default StreamList;
