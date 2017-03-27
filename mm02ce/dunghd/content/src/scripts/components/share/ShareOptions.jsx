import React from 'react';
import { pure, withState, withHandlers, compose } from 'recompose';
import styled from 'styled-components';

/* eslint-disable no-confusing-arrow */
const Option = styled.button`
  float: left;
  background-color: ${props => props.primary ? '#0084ff' : '#9e9e9e'};
  color: ${props => props.primary ? '#fff' : '#000'} ;
  width: fit-content;
  min-width: 100px;
  height: 50px;
  font-size: 14px;
  border: ${props => props.primary ? '1px solid #607d8b' : '0'};
  border-radius: 10px;
  text-align: center;
  margin: 0 10px !important;
  &:hover {
    cursor: pointer;
    background: #dedede;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }
`;

const style = {
  margin: '10px auto',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};

const enhance = compose(
  withState('active', 'setActive', 'site'),
  withHandlers({
    handleChange: props => (val) => {
      props.setActive(val);
    },
  }),
  pure,
);

const ShareOptions = enhance(({ tld, active, handleChange }) =>
  <div style={style}>
    <Option primary={active === 'site'} onClick={() => { handleChange('site'); }} >just this page</Option>
    <Option primary={active === 'tld'} onClick={() => { handleChange('tld'); }}>{tld}</Option>
    <Option primary={active === 'all'} onClick={() => { handleChange('all'); }}> *.* <br />all my browsing!</Option>
  </div>,
);
export default ShareOptions;
