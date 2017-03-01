/**
*
* GraphKnowledge
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import googleKnownledgeIcon from './images/google-knowledge-graph.png';

const Wrapper = styled.section`
  padding: 10px;
  background-color: #eaeaeb;
  background-image: url(${googleKnownledgeIcon});
  background-repeat: no-repeat;
  background-size: 24px;
  border-radius: 6px;
  &:after {
      content: '';
      display: block;
      clear: both;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
  }
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
  max-width: 210px;
  margin-bottom: 10px;
  border-radius: 8px;
  vertical-align: middle;
  margin: 0 auto;
  display: block;
`;

const Title = styled.h1`
  font-size: 24px;
  line-height: 24px;
  text-align: left;
`;

const Description = styled.p`
  font-size: 16px;
  margin: 0;
  padding: 0 8px 16px;
  text-align: left;
`;


function GraphKnowledge(props) {
  return (
    <Wrapper>
      <Anchor href={props.url} target="_blank">
        {props.name && <Title>{props.name}</Title>}
      </Anchor>
      {props.image && <Image src={props.image} alt={props.name} />}
      {props.description && <Description>{props.description}</Description>}
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
