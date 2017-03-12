/**
*
* StreamItem
*
*/

import React from 'react';
import styled from 'styled-components';
import ReactStars from 'react-stars';
import moment from 'moment';
import noImage from './images/no-image.png';
const Wrapper = styled.section`
  padding: 10px;
  margin: 10px;
  width: 100%;
  float: left;
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
  width: 150px;
  height: 120px;
  padding: 10px;
  margin-right: 20px;
  background: #eee;
  box-shadow: 4px 7px 10px 8px rgba(153,150,153,0.72);
  vertical-align: middle;
  display: block;
  float: left;
`;

const Title = styled.h3`
  font-size: 14px;
  margin: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  font-size: 12px;
  margin: 0;
  padding: 0 8px 16px;
  text-align: left;
`;

/* eslint-disable camelcase */
function StreamItem({ url, maxScore }) {
  const { href, img, title, im_score, time_on_tab, hit_utc } = url;
  const rate = Math.ceil((im_score / maxScore) * 5);
  return (
    <Wrapper>
      <Anchor href={href} target="_blank">
        <Image src={img || noImage} alt={title} />
        <Title>{title}</Title>
      </Anchor>
      <Description> Earned XP {href.length} {moment.duration(time_on_tab).humanize()} </Description>
      <ReactStars edit={false} size={22} count={5} value={rate} />
      <Description>
        {moment(hit_utc).fromNow()}
      </Description>
    </Wrapper>
  );
}

StreamItem.propTypes = {
  url: React.PropTypes.object,
  maxScore: React.PropTypes.number,
};

export default StreamItem;
