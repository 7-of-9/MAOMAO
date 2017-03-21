import React from 'react';
import Draggable from 'react-draggable';
import { compose, pure, withState, withHandlers } from 'recompose';

import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import TwitterButton from './TwitterButton';
import LinkButton from './LinkButton';
import icon from './images/floating-icon.png';

const styles = {
  wrap: {
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
  },
  container: {
    zIndex: 9999,
    width: 'fit-content',
    color: '#000',
    borderRadius: '6px',
    background: '#fff',
    boxShadow: 'rgba(0, 0, 0, 0.14902) 3px 3px 11px 3px',
    textAlign: 'left',
  },
  floating: {
    zIndex: 9999,
    position: 'relative',
    width: '40px',
    height: '40px',
  },
};

const FloatingShare = ({ show, onShow, onHide, onToggle }) =>
  <Draggable
    axis="both"
    handle=".drag"
    defaultPosition={{ x: 0, y: 0 }}
    position={null}
    grid={[25, 25]}
    zIndex={1000}
  >
    <div style={styles.wrap}>
      <div onMouseEnter={onShow} style={styles.floating}>
        <img onClick={onToggle} className="drag" width="40" height="40" src={icon} alt="Maomao" />
      </div>
      <div style={{ display: show ? '' : 'none' }} className="arrow-up" />
      <div onMouseLeave={onHide} style={{ display: show ? '' : 'none', ...styles.container }}>
        <h3>Share this topic</h3>
        <div>
          <FacebookButton />
          <TwitterButton />
          <FacebookMessengerButton />
          <LinkButton />
        </div>
      </div>
    </div>
  </Draggable>;

const enhance = compose(
  withState('show', 'toggleShow', false),
  withHandlers({
     onToggle: ({ toggleShow }) => () => toggleShow(show => !show),
     onHide: ({ toggleShow }) => () => toggleShow(false),
     onShow: ({ toggleShow }) => () => toggleShow(true),
  }),
  pure,
);

export default enhance(FloatingShare);
