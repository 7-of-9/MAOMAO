import React from 'react';
import { pure, withState, withHandlers, compose } from 'recompose';
import styled from 'styled-components';
import Button from './Button';
import ggIcon from './images/google.svg';
import fbIcon from './images/facebook.svg';
import fbMsgIcon from './images/facebook-messenger.svg';
import linkIcon from './images/link.svg';

const GoogleButton = styled(Button)`
  float: left;
  background-image: url(${ggIcon});
`;
const FacebookButton = styled(Button)`
  float: left;
  background-image: url(${fbIcon});
`;
const FacebookMessengerButton = styled(Button)`
  float: left;
  background-image: url(${fbMsgIcon});
`;
const LinkButton = styled(Button)`
  float: left;
  background-image: url(${linkIcon});
`;

const style = {
  toolbar: {
    float: 'right',
    padding: '0 10px',
  },
};

const enhance = compose(
  withState('active', 'setActive', 'google'),
  withHandlers({
    handleChange: props => (val) => {
      props.setActive(val);
    },
  }),
  pure,
);

const Toolbar = enhance(({ active, handleChange }) =>
  <div style={style.toolbar}>
    <GoogleButton primary={active === 'google'} onClick={() => { handleChange('google'); }} />
    <FacebookButton primary={active === 'facebook'} onClick={() => { handleChange('facebook'); }} />
    <FacebookMessengerButton primary={active === 'facebook-messenger'} onClick={() => { handleChange('facebook-messenger'); }} />
    <LinkButton primary={active === 'link'} onClick={() => { handleChange('link'); }} />
  </div>,
);
export default Toolbar;
