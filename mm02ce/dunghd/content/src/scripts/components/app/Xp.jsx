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
  $('body').children().not('#maomao-extension-anchor').css('opacity', '1');
};

class Xp extends Component {

  constructor(props) {
    super(props);
    this.closePopup = this.closePopup.bind(this);
    this.state = {
      show: false,
      textAnimate: {},
      scoreAnimate: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.xp.score !== nextProps.xp.score || this.props.xp.text !== nextProps.xp.text) {
      if (this.state.show) {
        this.setState({
          textAnimate: styles.bounceOutUp,
          scoreAnimate: styles.bounceOutUp,
        }, () => {
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
      $('body').children().not('#maomao-extension-anchor').css('opacity', '0.6');
    }
  }

  closePopup() {
    this.setState({ show: false });
  }

  render() {
    const dummies = Object.keys(styles).map(
      key => <span key={key} style={styles[key]} />,
    );
    return (
      <div className="blurred" style={{ display: this.state.show ? 'block' : 'none', transform: `scale(${this.props.scale}) translate(-50%,-50%)` }}>
        <div className="inner_bg">
          <a onClick={this.closePopup} className="close_button" />
          {dummies}
          <div style={this.state.textAnimate} className="nlp_topic">{this.props.xp.text}</div>
          <div
            style={this.state.scoreAnimate}
            className="nlp_score"
          >
            <CountUp
              start={0}
              end={this.props.xp.score}
              useEasing
              prefix="+"
              suffix=" XP"
              callback={resetFontSize}
            />
          </div>
          <a className="share" href={this.props.shareTopics}>Share...</a>
        </div>
      </div>
    );
  }
}

Xp.propTypes = {
  xp: PropTypes.object.isRequired,
  scale: PropTypes.number.isRequired,
  shareTopics: PropTypes.func,
};

export default Radium(Xp);
