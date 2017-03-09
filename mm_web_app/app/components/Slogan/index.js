/**
*
* Slogan
*
*/

import React from 'react';
import styled from 'styled-components';
import demoImg from './images/demo.jpg';


const Wrapper = styled.div`
  background-image: url(${demoImg});
  background-repeat: no-repeat;
  background-size: 40px 40px;
  margin-left: 16px;
  margin-right: 16px;
`;

const Title = styled.h1`
  color: #7d7b6f;
  float: left;
`;

const Description = styled.p`
  margin-left: 10px;
  margin-top: 30px;
  float: right;
`;

function Slogan() {
  return (
    <Wrapper>
      <Title> Maomao </Title>
      <Description> get smarter </Description>
    </Wrapper>
  );
}

Slogan.propTypes = {

};

export default Slogan;
