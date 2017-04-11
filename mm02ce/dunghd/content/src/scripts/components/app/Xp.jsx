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

let timer;

const enhance = compose(
  withState('show', 'changeShow', true),
  withState('text', 'changeText', ''),
  withState('score', 'changeScore', 0),
  withState('counter', 'changeCounter', 0),
  withHandlers({
    closePopup: props => () => {
      props.changeShow(false);
      clearInterval(timer);
      props.closeXp();
    },
    openShare: props => () => {
      props.changeShow(false);
      props.shareTopics();
    },
    playNextItem: props => () => {
      logger.info('playNextItem', props);
      if (props.show) {
        if (props.counter < props.terms.length) {
          const counter = props.counter + 1;
          props.changeCounter(counter);
          const xp = props.terms[counter];
          if (xp) {
            props.changeText(xp.text);
            props.changeScore(xp.score);
          } else {
            props.closeXp();
          }
        } else {
          logger.info('close xp popup');
          props.closeXp();
        }
      } else {
        clearInterval(timer);
      }
    },
  }),
  lifecycle({
    componentDidMount() {
      logger.info('XP');
      const xp = this.props.terms[this.props.counter];
      if (xp) {
        this.props.changeText(xp.text);
        this.props.changeScore(xp.score);
      }
      timer = setInterval(() => {
        this.props.playNextItem();
      }, 5000);
    },
    componentWillUnmount() {
      clearInterval(timer);
    },
  }),
  onlyUpdateForKeys(['terms']),
);

const Xp = enhance(({
  show, text, score, counter,
  closePopup, openShare }) => (
    <div className="blurred" style={{ display: show && score > 0 ? 'block' : 'none' }}>
      <a className="close_popup" onTouchTap={closePopup}><i className="fa fa-close" /></a>
      <div className="inner_bg">
        {dummies}
        <div
          style={counter === 0 ? styles.bounceInUp : styles.bounceOutUp}
          className="nlp_topic"
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
