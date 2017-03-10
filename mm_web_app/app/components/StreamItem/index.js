/**
*
* StreamItem
*
*/

import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.section`
  padding: 10px;
  margin: 10px;
  background: #607d8b;
  width: 300px;
  float: left;
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

const Title = styled.h3`
  font-size: 14px;
  margin: 0;
  padding: 0 8px 0px;
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
function StreamItem({ url }) {
  const { href, img, title, im_score, time_on_tab } = url;
  return (
    <Wrapper>
      <Anchor href={href} target="_blank">
        {img && <Image src={img} alt={title} /> }
        <Title>{title}</Title>
      </Anchor>
      <Description> Score: {im_score}, Time on tabs: {time_on_tab} </Description>
    </Wrapper>
  );
}

StreamItem.propTypes = {
  url: React.PropTypes.object,
};

export default StreamItem;
