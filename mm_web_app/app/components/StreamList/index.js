/**
*
* StreamList
*
*/

import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import StreamItem from 'components/StreamItem';

const Wrapper = styled.div`
  width: 75%;
  float: right;
  padding: 1em;
`;

function StreamList({ urls }) {
  const items = [];
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
  urls: React.PropTypes.array,
};

export default StreamList;
