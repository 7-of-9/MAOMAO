import React from 'react';
import { pure, compose } from 'recompose';
import styled from 'styled-components';

/* eslint-disable no-confusing-arrow */
const Option = styled.button`
  float: left;
  background-color: ${props => props.primary ? '#0084ff' : '#9e9e9e'};
  color: ${props => props.primary ? '#fff' : '#000'} ;
  width: fit-content;
  height: 40px;
  margin: 0 5px;
  text-align: center;
  border: ${props => props.primary ? '1px solid #607d8b' : '0'};
  border-radius: 10px;
  &:hover {
    cursor: pointer;
    background: #dedede;
  }
`;

const style = {
  margin: '10px auto',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};

const enhance = compose(
  pure,
);

const ShareOptions = enhance(({ topic, active, onChange }) =>
  <div style={style}>
    <Option primary={active === 'site'} onClick={() => { onChange('site'); }} >just this page</Option>
    { topic && <Option primary={active === 'topic'} onClick={() => { onChange('topic'); }}>{topic}</Option> }
    <Option primary={active === 'all'} onClick={() => { onChange('all'); }}> *.* <br />all my browsing!</Option>
  </div>,
);
export default ShareOptions;
