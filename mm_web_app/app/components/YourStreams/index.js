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
    cursor: pointer;
  }
`;

const Link = styled.a`
  width: 100%;
`;

function YourStreams({ breadcrumbs, topics, activeTermId, change }) {
  const items = [];
  let parentId;
  let rootId;
  let termName;
  let termUrls;
  if (breadcrumbs && breadcrumbs.length) {
    rootId = breadcrumbs[0].parentId;
    parentId = breadcrumbs[breadcrumbs.length - 1].parentId;
    termName = breadcrumbs[breadcrumbs.length - 1].termName;
    termUrls = breadcrumbs[breadcrumbs.length - 1].termUrls;
  }

  let activeId = activeTermId;
  if (activeId === -1) {
      // set active to first term_id
    activeId = (topics && topics[0] && topics[0].term_id) || -1;
  }

  if (topics && topics.length) {
    const sortedTopicByUrls = _.reverse(_.sortBy(topics, [(topic) => topic.url_ids.length]));
    _.forEach(sortedTopicByUrls, (topic) => {
      if (topic.term_id) {
        items.push(<TopicName
          onClick={(e) => {
            e.preventDefault();
            if (rootId && rootId !== activeId) {
              change(parentId);
            } else {
              change(topic.term_id);
            }
          }} style={{ color: activeTermId === topic.term_id || (rootId > 0 && rootId === topic.term_id) ? '#000' : '#fff' }} key={topic.term_id}
        >
          { rootId !== topic.term_id &&
            <Link>
              {topic.term_name} ({topic.url_ids.length})
              </Link>
            }
          { rootId === topic.term_id &&
          <Link>
            {'<'} {termName} ({termUrls})
                </Link>
              }
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
  breadcrumbs: React.PropTypes.array.isRequired,
  topics: React.PropTypes.array.isRequired,
  activeTermId: React.PropTypes.number.isRequired,
  change: React.PropTypes.func,
};

export default YourStreams;
