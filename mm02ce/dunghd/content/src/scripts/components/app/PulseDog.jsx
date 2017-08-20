import React from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { onlyUpdateForKeys, withState, lifecycle, compose } from 'recompose';
import Radium from 'radium';
import iconImage from './images/dog_blue.png';
import logger from '../utils/logger';

function PulseDog({ show, isReady, hideOnTimer, openShare, changeShow }) {
  logger.info('PulseDog isReady, hideOnTimer', isReady, hideOnTimer);
  let component = <div />;
  if (show && isReady) {
    component = (
      <div style={{ zIndex: 1000, cursor: 'pointer', bottom: '50px', right: '25px', position: 'fixed' }}>
        <div className="pulse-blue-dog">
          <button onClick={() => { openShare(); changeShow(false); }}>
            <img src={iconImage} width="75" height="75" alt="pulse dog" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <TransitionGroup>
      <CSSTransition
        classNames="maomao"
        timeout={{ enter: 500, exit: 300 }}
      >
        {component}
      </CSSTransition>
    </TransitionGroup>
  );
}

const propTypes = {
  hideOnTimer: PropTypes.number.isRequired,
  show: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
  openShare: PropTypes.func.isRequired,
  changeShow: PropTypes.func,
};

const defaultProps = {
  hideOnTimer: 5000,
  show: false,
  isReady: false,
  openShare: () => { },
  changeShow: () => { },
};

PulseDog.propTypes = propTypes;
PulseDog.defaultProps = defaultProps;

const enhance = compose(
  withState('show', 'changeShow', true),
  withState('timer', 'changeTimer', null),
  lifecycle({
    componentDidMount() {
      logger.info('PulseDog componentDidMount');
      if (this.props.isReady) {
        logger.info('animate and close popup in', this.props.hideOnTimer);
        this.props.changeTimer(() => setTimeout(() => {
          this.props.changeShow(false);
        }, this.props.hideOnTimer));
      }
    },
    componentWillReceiveProps(nextProps) {
      logger.info('PulseDog componentWillReceiveProps', nextProps);
      if (nextProps.isReady && nextProps.isReady !== this.props.isReady) {
        logger.info('animate and close popup in', this.props.hideOnTimer);
        this.props.changeTimer(() => setTimeout(() => {
          this.props.changeShow(false);
        }, this.props.hideOnTimer));
      }
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

