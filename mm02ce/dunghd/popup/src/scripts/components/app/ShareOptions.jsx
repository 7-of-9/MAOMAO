import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button'; // https://gdowens.github.io/react-toggle-button/
import { guid } from './utils';

/* eslint-disable no-confusing-arrow */
const Option = styled(ToggleButton)`
  &:hover {
    cursor: pointer;
    background: #dedede;
  }
`;

const style = {
  width: '100%',
  height: '100%',
  textAlign: 'center',
  overflow: 'hidden',
  zIndex: 1000,
};

const enhance = compose(
  onlyUpdateForKeys(['topic', 'active']),
);

const ShareOptions = enhance(({ topics, active, onChange }) =>
  <div style={style} className="share-topic">
    <p className="share-topic-title"> Single URL: </p>
    <div className="switch-list">
      <div className="switch-select">
        <Option key={guid()} value={active === 'site'} onToggle={() => { onChange('site'); }} />
        <span>just this page</span>
      </div>
    </div>
    <p className="share-topic-title"> Topics (Multiple URLs):</p>
    <div className="switch-list mb0">
      {
        topics.map(topic =>
          topic.id &&
          <div key={guid()} className="switch-select">
            <Option
              key={guid()}
              value={active === topic.id}
              onToggle={() => {
              onChange(topic.id);
            }}
            />
            <span className="type-name">{topic.name}</span>
          </div>,
        )
      }
    </div>
    <p className="share-topic-title"> All URLs: </p>
    <div className="switch-list">
      <div className="switch-select">
        <Option key={guid()} value={active === 'all'} onToggle={() => { onChange('all'); }} />
        <span>My browsing history</span>
      </div>
    </div>
  </div>,
);
export default ShareOptions;
