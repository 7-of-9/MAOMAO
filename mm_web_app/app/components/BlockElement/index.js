/**
*
* BlockElement
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { truncate } from 'lodash';
import googleKnownledgeIcon from './images/google-knowledge-graph.png';
import googleNewsIcon from './images/google-news.png';
import googleIcon from './images/google.png';
import youtubeIcon from './images/youtube.png';
import redditIcon from './images/reddit.png';

const Wrapper = styled.section`
  padding: 10px;
  border-radius: 6px;
  &:after {
      content: '';
      display: block;
      clear: both;
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
  width: 210px;
  margin-bottom: 10px;
  border-radius: 8px;
  vertical-align: middle;
  margin: 5px auto;
  display: block;
`;

const Description = styled.p`
  font-size: 12px;
  margin: 0;
  padding: 0 8px 16px;
  text-align: left;
`;

const Source = styled.span`
  font-size: 12px;
  margin: 0;
  padding: 0 8px 16px;
  text-align: left;
`;

const Icon = styled.img`
  float: left;
  width: 32px;
  height: 32px;
`;


function iconType(type) {
  switch (type) {
    case 'Google Knowledge':
      return googleKnownledgeIcon;
    case 'Google News':
      return googleNewsIcon;
    case 'Youtube':
      return youtubeIcon;
    case 'Reddit':
      return redditIcon;
    default:
      return googleIcon;
  }
}

function BlockElement(props) {
  return (
    <Wrapper>
      <Anchor href={props.url} target="_blank">
        {props.image && <Image src={props.image} alt={props.name} />}
      </Anchor>
      {props.description && <Description>{truncate(props.description, { length: 100, separator: /,? +/ })}</Description>}
      <Source>
        <Icon src={iconType(props.type)} />
        {props.type}
      </Source>
    </Wrapper>
  );
}

BlockElement.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
};

export default BlockElement;
