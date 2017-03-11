/**
*
* Slogan
*
*/

import React from 'react';
import styled from 'styled-components';
import demoImg from './images/demo.jpg';
import maomaoImg from './images/maomao.png';

const Wrapper = styled.div`
  background-image: url(${demoImg});
  background-repeat: no-repeat;
  background-size: 40px 40px;
  margin-left: 16px;
  margin-right: 16px;
`;

const MaomaoImage = styled.img`
  margin-left: 0px;
  margin-top: 30px;
  float: left;
`;

const Description = styled.p`
  margin-left: 10px;
  margin-top: 30px;
  float: right;
  color: #c0c0c0;
`;

function Slogan() {
  return (
    <Wrapper>
      <MaomaoImage src={maomaoImg} />
      <Description> get smarter </Description>
    </Wrapper>
  );
}

Slogan.propTypes = {

};

export default Slogan;
