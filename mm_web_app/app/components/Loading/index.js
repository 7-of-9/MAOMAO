/**
*
* Loading
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';

import loadingSVG from './images/loading.svg';
const Wrapper = styled.div`
  text-align: center;
  margin: 0 auto;
`;
function Loading(props) {
  return (
    <Wrapper style={{ display: props.isLoading ? '' : 'none' }}>
      <img alt="Loading" src={loadingSVG} />
    </Wrapper>
  );
}

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default Loading;
