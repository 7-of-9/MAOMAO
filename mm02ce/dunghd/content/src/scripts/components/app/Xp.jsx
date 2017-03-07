import React, { Component, PropTypes } from 'react';
import CountUp from 'react-countup';
import { bounceInUp, zoomInUp, bounceOutUp } from 'react-animations';
import Radium from 'radium';
import $ from 'jquery';

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

const resetFontSize = () => {
  $('.blurred').find('.nlp_score').css('font-size', '100%');
};

const randomElement = items => items[Math.floor(Math.random() * items.length)];

class Xp extends Component {

  constructor(props) {
    super(props);
    this.closePopup = this.closePopup.bind(this);
    this.openShare = this.openShare.bind(this);
    this.state = {
      show: true,
      textAnimate: {},
      scoreAnimate: {},
    };

    this.timer = setInterval(() => {
      if (this.props.terms.length > 1) {
        console.time('start to animation');
        if (this.state.show) {
          this.setState({
            textAnimate: styles.bounceOutUp,
            scoreAnimate: styles.bounceOutUp,
          }, () => {
            console.timeEnd('end time to animation');
            setTimeout(() => {
              this.setState({
                textAnimate: styles.bounceInUp,
                scoreAnimate: styles.zoomInUp,
              });
            }, 1000);
          });
        } else {
          this.state = {
            scoreAnimate: styles.zoomInUp,
            textAnimate: styles.bounceInUp,
            show: true,
          };
        }
        $('.blurred').find('.nlp_score').css('font-size', '120%');
        // $('body').children().not('#maomao-extension-anchor').css('opacity', '0.6');
      }
    }, 10000);
  }

  componentWillUnmount() {
    console.warn('componentDidUnmount');
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  closePopup() {
    this.setState({ show: false });
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  openShare() {
    this.setState({ show: false });
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.props.shareTopics();
  }

  render() {
    const dummies = Object.keys(styles).map(
      key => <span key={key} style={styles[key]} />,
    );
    const xp = randomElement(this.props.terms);
    return (
      <div className="blurred" style={{ display: this.state.show && this.props.terms.length > 0 ? 'block' : 'none', transform: 'scale(1.0) translate(-50%,-50%)' }}>
        <div className="inner_bg">
          <a onClick={this.closePopup} className="close_button" />
          {dummies}
          <div style={this.state.textAnimate} className="nlp_topic">{xp && xp.text}</div>
          <div
            style={this.state.scoreAnimate}
            className="nlp_score"
          >
            <CountUp
              start={0}
              end={xp && xp.score}
              useEasing
              prefix="+"
              suffix=" XP"
              callback={resetFontSize}
            />
          </div>
          <a className="share-button" onClick={this.openShare}>Share...</a>
        </div>
      </div>
    );
  }
}

Xp.propTypes = {
  terms: PropTypes.array.isRequired,
  shareTopics: PropTypes.func.isRequired,
};

export default Radium(Xp);
