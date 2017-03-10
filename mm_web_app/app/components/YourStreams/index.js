/**
*
* YourStreams
*
*/

import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';

const Wrapper = styled.div`
  float: left;
  width: 20%;
  padding: 1em 0;
`;

const TopicList = styled.ul`
  list-style: none;
  padding: 0;
  text-align: center;
`;

const TopicName = styled.li`
  background: #009688;
  color: #fff;
  padding: 1em 0;
  margin-bottom: 0.5em;
  &:hover {
    background: #9e9e9e;
    color: #000;
  }
`;

const Link = styled.a`
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`;

function YourStreams({ topics, activeTermId, change }) {
  const items = [];
  let activeId = activeTermId;
  if (activeId === -1) {
      // set active to first term_id
    activeId = (topics && topics[0] && topics[0].term_id) || -1;
  }
  if (topics && topics.length) {
    const sortedTopicByUrls = _.reverse(_.sortBy(topics, [(topic) => topic.url_ids.length]));
    _.forEach(sortedTopicByUrls, (topic) => {
      if (topic.term_id) {
        items.push(<TopicName style={{ color: activeTermId === topic.term_id ? '#000' : '#fff' }} key={topic.term_id}>
          <Link
            onClick={(event) => {
              event.preventDefault();
              change(topic.term_id);
            }}
          >{topic.term_name} ({topic.url_ids.length})</Link>
        </TopicName>);
      }
    });
  }

  return (
    <Wrapper>
      <TopicList>
        {items}
      </TopicList>
    </Wrapper>
  );
}

YourStreams.propTypes = {
  topics: React.PropTypes.array.isRequired,
  activeTermId: React.PropTypes.number.isRequired,
  change: React.PropTypes.func,
};

export default YourStreams;
