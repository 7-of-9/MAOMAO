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
  background-color: #eaeaeb;
  background-image: url(${googleNewsIcon});
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

const Image = styled.img`
  object-fit contain;
  max-width: 210px;
  float: left;
  margin: 15px 10px 15px 0px;
  border-radius: 8px;
`;

function GoogleNews(props) {
  return (
    <Wrapper>
      <Anchor href={props.url} target="_blank">
        {props.title && <Title>{props.title}</Title>}
      </Anchor>
      {props.image && <Image src={props.image} alt={props.title} />}
      {props.description && <Description>{props.description}</Description>}
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
