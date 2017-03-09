/**
*
* FriendStream
*
*/

import React from 'react';
import styled from 'styled-components';
import starIcon from './images/star.png';
import goldStarIcon from './images/star_gold.png';
import leftIcon from './images/arrow-left.png';
import rightIcon from './images/arrow-right.png';

const Wrapper = styled.div`
  padding: 1em;
  margin: 0 auto;
  text-align: center;
`;

const LeftArrow = styled.div`
  background-image: url(${leftIcon});
  background-repeat: no-repeat;
  height: 100px;
  width: 100px;
  float: left;
`;

const RightArrow = styled.div`
  background-image: url(${rightIcon});
  background-repeat: no-repeat;
  height: 100px;
  width: 100px;
  float: left;
`;

const Star = styled.div`
  background-image: url(${starIcon});
  background-repeat: no-repeat;
  height: 20px;
  width: 20px;
  background-size: 20px 20px;
  float: left;
`;

const GoldStar = styled.div`
  background-image: url(${goldStarIcon});
  background-repeat: no-repeat;
  height: 24px;
  width: 24px;
  background-size: 24px 24px;
  float: left;
`;

const Title = styled.h3`
  padding: 1e;
`;

const Stream = styled.div`
  height: 280px;
  padding: 1em;
  margin: 0 auto;
  text-align: center;
  border: 1px solid #000;
`;

const StreamItem = styled.div`
  padding: 1em;
  margin: 0 auto;
  text-align: left;
  width: 320px;
  float: left;
`;

const Thumbnail = styled.img`
  float: left;
  padding: 5px;
  border: 3px solid #eaeaeb;
  width: 100px;
  height: 75px;
  margin: 5px;
`;

const Description = styled.p`
  margin: 0 auto;
  text-align: left;
`;

const Link = styled.a`
  margin: 0 auto;
  text-align: left;
  font-size: 12px;
`;

const Intro = styled.p`
  padding: 1em;
  margin: 0 auto;
  text-align: left;
`;

const More = styled.p`
  padding: 1em;
  margin: 0 auto;
  text-align: center;
  width: 100%;
  float: left;
`;

const BoldText = styled.span`
  font-weight: bolder;
  font-size: 120%;
`;

function FriendStream({ name, topic }) {
  return (
    <Wrapper>
      <Title>{name} wants to share with you: <BoldText>{'"'}{topic}{'"'}</BoldText></Title>
      <Stream>
        <Intro>{name} has xp {(topic && topic.length * 100) || (Math.floor(Math.random() * 100) + 1)} XP in <BoldText>{topic}</BoldText>. Some of his best picks...</Intro>
        <LeftArrow />
        <StreamItem>
          <Thumbnail src="http://placehold.it/100x75?text=Url Thumbnail" />
          <Link href="http://www.hrw.org">www.hrw.org</Link>
          <Description>Earned XP 15 3.5 mins</Description>
          <GoldStar /> <GoldStar /> <GoldStar /> <GoldStar /> <GoldStar />
        </StreamItem>
        <StreamItem>
          <Thumbnail src="http://placehold.it/100x75?text=Url Thumbnail" />
          <Link href="http://www.hrw.org">www.hrw.org</Link>
          <Description>Earned XP 15 3.5 mins</Description>
          <GoldStar /><GoldStar /><GoldStar /><GoldStar /><Star />
        </StreamItem>
        <RightArrow />
        <More><BoldText>+85</BoldText> other pages, 125 mins, over last 3 weeks...</More>
      </Stream>
    </Wrapper>
  );
}

FriendStream.propTypes = {
  name: React.PropTypes.string,
  topic: React.PropTypes.string,
};

export default FriendStream;
