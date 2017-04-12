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
  margin: '20px auto 10px',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  overflow: 'hidden',
};

const enhance = compose(
  onlyUpdateForKeys(['topic', 'active']),
);

const ShareOptions = enhance(({ topics, active, onChange }) =>
  <div style={style} className="share-options">
    <p> Single URL: </p>
    <div>
      <Option value={active === 'site'} onToggle={() => { onChange('site'); }} />
      <span>just this page</span>
    </div>
    <p> Topics (Multiple URLs):</p>
    {
    topics.map(topic =>
      <div key={guid()}>
        <Option
          key={guid()}
          value={active === topic.id}
          onToggle={() => {
          onChange(topic.id);
        }}
        />
        <span>{topic.name}</span>
      </div>,
    )
  }
  </div>,
);
export default ShareOptions;
