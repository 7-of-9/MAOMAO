/**
*
* GoogleResult
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';

const Wrapper = styled.section`
  padding: 10px;
  background: #222;
`;

const Anchor = styled.a`
  color: #41addd;
  text-decoration: none;
   &:hover {
     color: #6cc0e5;
   }
`;

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.2em;
  text-align: center;
`;


function GoogleResult(props) {
  return (
    <Wrapper>
      <Anchor href={props.url} target="_blank">
        {props.title && <Title>{props.title}</Title>}
      </Anchor>
      {props.description && <Description>{props.description}</Description>}
    </Wrapper>
  );
}

GoogleResult.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  url: PropTypes.string,
};

export default GoogleResult;
