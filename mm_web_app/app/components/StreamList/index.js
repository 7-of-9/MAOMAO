/**
*
* StreamList
*
*/

import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import StreamCategory from 'components/StreamCategory';
import StreamItem from 'components/StreamItem';

const Wrapper = styled.div`
  float: right;
  width: 80%;
  padding: 1em;
`;

const Title = styled.h1`
  padding: 1em;
`;

function StreamList({ topic, urls }) {
  const items = [];
  if (topic && topic.child_topics) {
    _.forEach(topic.child_topics, (item) => {
      items.push(<StreamCategory key={item.term_id} topic={item} />);
    });
  }
  if (urls && urls.length) {
    _.forEach(urls, (item) => {
      items.push(<StreamItem key={item.id} url={item} />);
    });
  }
  return (
    <Wrapper>
      <Title>
        {topic.term_name}
      </Title>
      {items}
    </Wrapper>
  );
}

StreamList.propTypes = {
  topic: React.PropTypes.object,
  urls: React.PropTypes.array,
};

export default StreamList;
