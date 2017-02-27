/**
*
* GoogleResult
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import googleNewsIcon from './images/google-news.png';

const Wrapper = styled.section`
  padding: 10px;
  background: #222;
  background-image: url(${googleNewsIcon});
  background-repeat: no-repeat;
  background-size: 32px;
`;

const Anchor = styled.a`
  color: #ccc;
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

const Image = styled.img`
  object-fit contain;
  max-width: 230px;
`;

function GoogleNews(props) {
  return (
    <Wrapper>
      <Anchor href={props.url} target="_blank">
        {props.title && <Title>{props.title}</Title>}
      </Anchor>
      {props.description && <Description>{props.description}</Description>}
      {props.image && <Image src={props.image} alt={props.title} />}
    </Wrapper>
  );
}

GoogleNews.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
};

export default GoogleNews;
