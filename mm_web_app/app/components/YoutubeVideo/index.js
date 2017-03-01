/**
*
* YoutubeVideo
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import youtubeIcon from './images/youtube.png';

const Wrapper = styled.section`
  padding: 10px;
  background-color: #eaeaeb;
  background-image: url(${youtubeIcon});
  background-repeat: no-repeat;
  background-size: 32px;
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
`;

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.2em;
  text-align: center;
  word-break: break-all;
`;

function YoutubeVideo(props) {
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

YoutubeVideo.propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
};


export default YoutubeVideo;
