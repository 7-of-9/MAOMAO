/**
*
* StreamCategory
*
*/

import React from 'react';
import styled from 'styled-components';
import DiscoveryButton from 'components/DiscoveryButton';
import _ from 'lodash';

const Wrapper = styled.div`
    padding: 0.5em;
    width: 250px;
    float: left;
    margin: 10px;
`;

const Link = styled.a`
    &:hover {
      padding: 10px;
      background: #9e9e9e;
      color: #000;
      cursor: pointer;
    }
`;

function StreamCategory({ parentId, parentName, topic, change }) {
  let discoveryKeys = [];
  if (topic && topic.suggestions && topic.suggestions.length) {
    discoveryKeys = _.map(topic.suggestions, 'term_name');
  }
  return (
    <Wrapper>
      <Link
        onClick={(e) => {
          e.preventDefault();
          change({
            termId: topic.term_id,
            termName: topic.term_name,
            termUrls: topic.url_ids.length,
            parentId,
            parentName,
          });
        }}
      >{topic.term_name} ({topic.url_ids.length})</Link>
      {discoveryKeys && discoveryKeys.length > 0 && <DiscoveryButton keys={discoveryKeys.join(',')} /> }
    </Wrapper>
  );
}

StreamCategory.propTypes = {
  topic: React.PropTypes.object,
  parentId: React.PropTypes.number,
  parentName: React.PropTypes.string,
  change: React.PropTypes.func,
};

export default StreamCategory;
