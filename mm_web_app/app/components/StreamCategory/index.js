/**
*
* StreamCategory
*
*/

import React from 'react';
import styled from 'styled-components';

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

function StreamCategory({ topic, change }) {
  return (
    <Wrapper>
      <Link
        onClick={(e) => {
          e.preventDefault();
          change(topic.term_id);
        }}
      >{topic.term_name} ({topic.url_ids.length})</Link>
    </Wrapper>
  );
}

StreamCategory.propTypes = {
  topic: React.PropTypes.object,
  change: React.PropTypes.func,
};

export default StreamCategory;
