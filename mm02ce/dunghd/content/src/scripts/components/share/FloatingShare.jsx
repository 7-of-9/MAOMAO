import React from 'react';
import Draggable from 'react-draggable';
import { compose, pure, withState, withHandlers } from 'recompose';

import FacebookButton from './FacebookButton';
import FacebookMessengerButton from './FacebookMessengerButton';
import TwitterButton from './TwitterButton';
import LinkButton from './LinkButton';

const styles = {
  wrap: {
    zIndex: 9999,
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
  },
  floating: {
    position: 'relative',
    width: '60px',
    height: '60px',
  },
};

const FloatingShare = ({ show, onShow }) =>
  <Draggable
    axis="both"
    handle=".maomao-logo"
    defaultPosition={{ x: 0, y: 0 }}
    position={null}
    grid={[25, 25]}
    zIndex={1000}
  >
    <div style={styles.wrap}>
      <div onClick={onShow} style={styles.floating} className="maomao-logo" />
      <div style={{ display: show ? '' : 'none' }}>
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
     onShow: ({ toggleShow }) => () => toggleShow(show => !show),
  }),
  pure,
);

export default enhance(FloatingShare);
