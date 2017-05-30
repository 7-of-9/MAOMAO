import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys, withState, lifecycle, compose } from 'recompose';
import Radium from 'radium';
import iconImage from './images/dog_blue.png';
import logger from '../utils/logger';

function PulseDog({ show, isReady, hideOnTimer, openShare }) {
  logger.info('PulseDog isReady, hideOnTimer', isReady, hideOnTimer);
  return (
    <div style={{ zIndex: 1000, top: '150px', right: '25px', position: 'fixed', display: show && isReady ? 'block' : 'none' }}>
      <div className="pulse-blue-dog">
        <button onClick={openShare}>
          <img src={iconImage} width="75" height="75" alt="pulse dog" />
        </button>
      </div>
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
      this.props.changeShow(false);
      if (this.props.timer) {
        clearTimeout(this.props.timer);
      }
    },
  }),
  onlyUpdateForKeys(['isReady', 'show']),
);

export default Radium(enhance(PulseDog));

