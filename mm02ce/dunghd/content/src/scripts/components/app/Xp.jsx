import React, { PropTypes } from 'react';
import { onlyUpdateForKeys, withState, withHandlers, lifecycle, compose } from 'recompose';
import CountUp from 'react-countup';
import { bounceInUp, zoomInUp, bounceOutUp } from 'react-animations';
import Radium from 'radium';
import * as logger from 'loglevel';

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
  withState('score', 'changeScore', 0),
  withState('counter', 'changeCounter', -1),
  withState('textAnimate', 'changeTextAnimate', {}),
  withState('scoreAnimate', 'changeScoreAnimate', {}),
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
      logger.warn('playNextItem', props);
      if (props.counter < props.terms.length) {
        props.changeTextAnimate(() => styles.zoomInUp);
        props.changeScoreAnimate(() => styles.bounceOutUp);
        const counter = props.counter + 1;
        const xp = props.terms[counter];
        props.changeText(() => xp.text);
        props.changeScore(() => xp.score);
        props.changeTextAnimate(() => styles.bounceOutUp);
        props.changeScoreAnimate(() => styles.bounceOutUp);
        setTimeout(() => {
          props.changeCounter(() => counter);
          props.playNextItem();
        }, 2000);
      } else {
        logger.warn('close xp popup');
        props.closeXp();
      }
    },
  }),
  lifecycle({
    componentDidMount() {
      logger.warn('componentDidMount', this.props);
      this.props.playNextItem();
    },
  }),
  onlyUpdateForKeys(['terms', 'text', 'score', 'counter']),
);

const Xp = enhance(({
  show, text, score, textAnimate, scoreAnimate,
  closePopup, openShare }) => (
    <div className="blurred" style={{ display: show && score > 0 ? 'block' : 'none' }}>
      <div className="inner_bg">
        <button onClick={closePopup} className="close_button" />
        {dummies}
        <div style={textAnimate} className="nlp_topic">{text}</div>
        <div
          style={scoreAnimate}
          className="nlp_score"
        >
          <CountUp
            start={0}
            end={score}
            useEasing
            prefix="+"
            suffix=" XP"
          />
        </div>
        <button className="share-button" onClick={openShare}>Share...</button>
      </div>
    </div>
));

Xp.propTypes = {
  shareTopics: PropTypes.func.isRequired,
  closeXp: PropTypes.func.isRequired,
};

export default Radium(Xp);
