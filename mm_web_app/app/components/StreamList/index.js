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
  width: 100%;
  padding: 1em;
`;

function StreamList({ topic, urls, change }) {
  const items = [];
  if (topic && topic.child_topics) {
    items.push(<div key={Date.now()} style={{ clear: 'both' }} />);
    _.forEach(topic.child_topics, (item) => {
      items.push(<StreamCategory parentId={topic.term_id} parentName={topic.term_name} change={change} key={item.term_id} topic={item} />);
    });
  }
  if (urls && urls.length) {
    const maxScore = _.maxBy(urls, 'im_score');
    const sortedUrlsByHitUTC = _.reverse(_.sortBy(urls, [(url) => url.hit_utc]));
    items.push(<div key={Date.now() + 1} style={{ clear: 'both' }} />);
    _.forEach(sortedUrlsByHitUTC, (item) => {
      items.push(<StreamItem key={item.id} url={item} maxScore={maxScore.im_score} />);
    });
  }
  return (
    <Wrapper>
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
