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

const Anchor = styled.a`
  color: #41addd;
  text-decoration: none;
   &:hover {
     color: #6cc0e5;
   }
`;

const Image = styled.img`
  object-fit contain;
  max-width: 230px;
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
      <Anchor href={props.url} target="_blank">
        {props.name && <Title>{props.name}</Title>}
      </Anchor>
      {props.description && <Description>{props.description}</Description>}
      {props.image && <Image src={props.image} alt={props.name} />}
    </Wrapper>
  );
}

GraphKnowledge.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
};

export default GraphKnowledge;
