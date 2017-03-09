/**
*
* Footer
*
*/

import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin: 0 auto;
  text-align: center;
  height: 100px;
`;

const Title = styled.h1`
  color: #7d7b6f;
`;

const Description = styled.span`
  font-size: 17px;
  color: #c0c0c0;
  font-weight: lighter;
`;


function Footer() {
  return (
    <Wrapper>
      <Title>Maomao <Description>the smarter way to share</Description>
      </Title>
    </Wrapper>
  );
}

Footer.propTypes = {

};

export default Footer;
