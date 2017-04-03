import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
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
  onlyUpdateForKeys(['active']),
);

const Toolbar = enhance(({ active, onChange, onShare, onSendMsg }) =>
  <div style={style.toolbar}>
    <GoogleButton primary={active === 'Google'} onClick={() => onChange('Google')} />
    <FacebookButton primary={active === 'Facebook'} onClick={onShare} />
    <FacebookMessengerButton primary={active === 'FacebookMessenger'} onClick={onSendMsg} />
    <LinkButton primary={active === 'Link'} onClick={() => onChange('Link')} />
  </div>,
);
export default Toolbar;
