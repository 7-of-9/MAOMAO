import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button';
import guid from '../utils/guid';

/* eslint-disable no-confusing-arrow */
const Option = styled(ToggleButton)`
  &:hover {
    cursor: pointer;
    background: #dedede;
  }
`;

const style = {
  margin: '0 auto',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  overflow: 'hidden',
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
        <span className="type-name">just this page</span>
      </div>
      <div className="checkbox__styled">
        <input className="checkbox__styled__input" id="checkbox-list-1" type="checkbox" name="checkbox" value="1" />
        <label className="checkbox__styled__label" for="checkbox-list-1">just this page</label>
      </div>
    </div>

    <p className="share-topic-title"> Topics (Multiple URLs):</p>
    <div className="switch-list">
      {
        topics.map(topic =>
          topic.id &&
          <div className="switch-select" key={guid()}>
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
        <span className="type-name">My browsing history</span>
      </div>
    </div>
  </div>,
);
export default ShareOptions;
