import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys, withState, lifecycle, compose } from 'recompose';
import { pulse } from 'react-animations';
import Radium from 'radium';
import iconImage from './images/dog_blue.png';
import logger from '../utils/logger';

function PulseDog({ show, isReady, hideOnTimer, openShare }) {
  logger.info('PulseDog isReady, hideOnTimer', isReady, hideOnTimer);
  const styles = {
    pulse: {
      animation: 'x 1s',
      animationName: Radium.keyframes(pulse, 'pulse'),
    },
  };
  const dummies = Object.keys(styles).map(
    key => <span key={key} style={styles[key]} />,
  );
  return (
    <div style={{ display: show && isReady ? 'block' : 'none' }}>
      {dummies}
      <button onClick={openShare}>
        <img style={styles.pulse} src={iconImage} width="128" height="128" alt="pulse dog" />
      </button>
    </div>
  );
}

const propTypes = {
  hideOnTimer: PropTypes.number.isRequired,
  show: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
  openShare: PropTypes.func.isRequired,
};

const defaultProps = {
  hideOnTimer: 5000,
  show: false,
  isReady: false,
  openShare: () => { },
};

PulseDog.propTypes = propTypes;
PulseDog.defaultProps = defaultProps;

const enhance = compose(
  withState('show', 'changeShow', true),
  withState('timer', 'changeTimer', null),
  lifecycle({
    componentDidMount() {
      logger.info('PulseDog componentDidMount');
      logger.info('animate and close popup in', this.props.hideOnTimer);
      this.props.changeTimer(() => setTimeout(() => {
        this.props.changeShow(false);
      }, this.props.hideOnTimer));
    },
    componentWillUnmount() {
      logger.info('PulseDog componentWillUnmount');
      if (this.timer > 0) {
        clearTimeout(this.timer);
      }
    },
  }),
  onlyUpdateForKeys(['isReady', 'show']),
);

export default Radium(enhance(PulseDog));

