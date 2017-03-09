/**
*
* UnlockNow
*
*/

import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 0 auto;
  text-align: center;
`;

const Button = styled.button`
  padding: 0.5em;
  background: #0b9803;
  width: 124px;
  color: #fff;
`;

function UnlockNow({ title, install }) {
  return (
    <Wrapper>
      <Button onClick={install}>{title} </Button>
    </Wrapper>
  );
}

UnlockNow.propTypes = {
  title: React.PropTypes.string.isRequired,
  install: React.PropTypes.function,
};

export default UnlockNow;
