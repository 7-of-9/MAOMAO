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

const Link = styled.a`
    &:hover {
      padding: 10px;
      background: #9e9e9e;
      color: #000;
      cursor: pointer;
    }
`;

function StreamList({ topic, urls, change }) {
  const items = [];
  if (topic && topic.child_topics) {
    items.push(<div key={Date.now()} style={{ clear: 'both' }} />);
    _.forEach(topic.child_topics, (item) => {
      items.push(<StreamCategory change={change} key={item.term_id} topic={item} />);
    });
  }
  if (urls && urls.length) {
    items.push(<div key={Date.now() + 1} style={{ clear: 'both' }} />);
    _.forEach(urls, (item) => {
      items.push(<StreamItem key={item.id} url={item} />);
    });
  }
  return (
    <Wrapper>
      <Title>
        <Link
          onClick={(e) => {
            e.preventDefault();
            change(topic.term_id);
          }}
        >{topic.term_name}
        </Link>
      </Title>
      {items}
    </Wrapper>
  );
}

StreamList.propTypes = {
  topic: React.PropTypes.object,
  urls: React.PropTypes.array,
  change: React.PropTypes.func,
};

export default StreamList;
