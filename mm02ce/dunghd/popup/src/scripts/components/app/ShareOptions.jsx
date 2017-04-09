import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';

/* eslint-disable no-confusing-arrow */
const Option = styled.button`
  background-color: ${props => props.primary ? '#0084ff' : '#9e9e9e'};
  color: ${props => props.primary ? '#fff' : '#000'} ;
  font-size: 14px;
  border: ${props => props.primary ? '1px solid #607d8b' : '0'};
  border-radius: 10px;
  text-align: center;
  margin: 0 10px !important;
  display: inline-block;
  padding: 6px 12px;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
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
  zIndex: 1000,
};

const enhance = compose(
  onlyUpdateForKeys(['topic', 'active']),
);

const ShareOptions = enhance(({ topic, active, onChange }) =>
  <div style={style} className="share-options">
    <Option className="button-site" primary={active === 'site'} onClick={() => { onChange('site'); }} >just this page</Option>
    { topic && <Option className="button-topic" primary={active === 'topic'} onClick={() => { onChange('topic'); }}>{topic}</Option> }
    <Option className="button-all" primary={active === 'all'} onClick={() => { onChange('all'); }}> *.* all my browsing!</Option>
  </div>,
);
export default ShareOptions;
