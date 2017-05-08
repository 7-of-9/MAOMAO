import React from 'react';
import PropTypes from 'prop-types';
import { withState, withHandlers, lifecycle, compose } from 'recompose';
import CountUp from 'react-countup';
import { bounceInUp, zoomInUp, bounceOutUp } from 'react-animations';
import Radium from 'radium';
import logger from '../utils/logger';

const styles = {
  bounceInUp: {
    animation: 'x',
    animationName: Radium.keyframes(bounceInUp, 'bounceInUp'),
    animationDuration: '2s',
  },
  zoomInUp: {
    animation: 'x',
    animationName: Radium.keyframes(zoomInUp, 'zoomInUp'),
    animationDuration: '2s',
  },
  bounceOutUp: {
    animation: 'x',
    animationName: Radium.keyframes(bounceOutUp, 'bounceOutUp'),
    animationDuration: '2s',
  },
};

const dummies = Object.keys(styles).map(
  key => <span key={key} style={styles[key]} />,
);

const enhance = compose(
  withState('show', 'changeShow', true),
  withState('text', 'changeText', ''),
  withState('timer', 'changeTimer', null),
  withState('score', 'changeScore', 0),
  withState('played', 'playedItem', []),
  withHandlers({
    closePopup: props => () => {
      props.changeShow(false);
      props.closeXp();
    },
    openShare: props => () => {
      props.changeShow(false);
      props.shareTopics();
    },
    playNextItem: props => () => {
      logger.info('playNextItem', props);
      if (props.show) {
        if (props.played.length < props.terms.length) {
          const counter = props.played.length;
          const xp = props.terms[counter];
          props.playedItem([...props.played, xp.text]);
          if (xp) {
            props.changeText(xp.text);
            props.changeScore(xp.score);
          }
        } else if (!props.timer) {
          // TODO: fadeout and cancel the fadeout if moveover
          logger.info('close xp popup in 10s');
          props.changeTimer(() => setTimeout(() => {
            props.changeShow(true);
            props.closeXp();
          }, 10000));
        }
      }
    },
  }),
  lifecycle({
    componentDidMount() {
      logger.info('XP componentDidMount');
      const xp = this.props.terms[this.props.counter];
      if (xp) {
        this.props.changeText(xp.text);
        this.props.changeScore(xp.score);
        this.props.changeShow(true);
      }
    },
    componentWillUnmount() {
      logger.info('XP componentWillUnmount');
      if (this.timer > 0) {
        clearTimeout(this.timer);
      }
    },
  }),
);

const Xp = enhance(({
  show, text, score, counter, isEnableExperimentalTopics,
  closePopup, openShare, playNextItem }) => {
  logger.info('XP');
  return (
    <div className="blurred" style={{ display: show && score > 0 ? 'block' : 'none' }}>
      <a className="close_popup" onClick={closePopup}><i className="icons-close" /></a>
      <div className="inner_bg">
        {dummies}
        <div
          style={counter === 0 ? styles.bounceInUp : styles.bounceOutUp}
          className={isEnableExperimentalTopics ? 'nlp_topic labs' : 'nlp_topic'}
        >{text}
        </div>
        <div
          style={counter === 0 ? styles.bounceInUp : styles.bounceOutUp}
          className="nlp_score"
        >
          <CountUp
            start={0}
            end={score}
            useEasing
            prefix="+"
            suffix=" XP"
            onComplete={playNextItem}
          />
        </div>
        <button className="share-button" onClick={openShare}>Share...</button>
      </div>
    </div >
  );
});

Xp.propTypes = {
  shareTopics: PropTypes.func.isRequired,
  closeXp: PropTypes.func.isRequired,
  isEnableExperimentalTopics: PropTypes.bool,
};

export default Radium(Xp);
