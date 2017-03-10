/**
*
* StreamCategory
*
*/

import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    padding: 0.5em;
    width: 150px;
    float: left;
    margin: 10px;
`;

function StreamCategory({ topic }) {
  return (
    <Wrapper>
      {topic.term_name} ({topic.url_ids.length})
    </Wrapper>
  );
}

StreamCategory.propTypes = {
  topic: React.PropTypes.object,
};

export default StreamCategory;
