/**
*
* GraphKnowledge
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';

const Wrapper = styled.section`
  padding: 10px;
  background: #969494;
`;

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.2em;
  text-align: center;
`;


function GraphKnowledge(props) {
  return (
    <Wrapper>
      <Title>{props.name}</Title>
      <Description>{props.description}</Description>
      <img src={props.image} alt={props.name} />
    </Wrapper>
  );
}

GraphKnowledge.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
};

export default GraphKnowledge;
