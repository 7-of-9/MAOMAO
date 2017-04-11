import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button'; // https://gdowens.github.io/react-toggle-button/

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
  <div style={style} className="share-options">
    <p> Single URL: </p>
    <div>
      <Option value={active === 'site'} onToggle={() => { onChange('site'); }} />
      <span>just this page</span>
    </div>
    <p> Topics (Multiple URLs):</p>
    {
      topics.map(topic =>
        <div>
          <Option
            key={topic.id}
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
