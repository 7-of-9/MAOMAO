import React, { Component, PropTypes } from 'react';
import CountUp from 'react-countup';
import { bounceInUp, bounceInRight, bounceOutUp } from 'react-animations';
import Radium from 'radium';
import ToggleDisplay from 'react-toggle-display';
import html2canvas from 'html2canvas';
import StackBlur from 'stackblur-canvas';
import $ from 'jquery';

window.jQuery = $;

require('../../vendors/vague');


const styles = {
  bounceInUp: {
    animation: 'x 1s',
    animationName: Radium.keyframes(bounceInUp, 'bounceInUp'),
    animationDuration: '3s',
  },
  bounceInRight: {
    animation: 'x 1s',
    animationName: Radium.keyframes(bounceInRight, 'bounceInRight'),
    animationDuration: '3s',
  },
  bounceOutUp: {
    animation: 'x',
    animationName: Radium.keyframes(bounceOutUp, 'bounceOutUp'),
    animationDuration: '4s',
  },
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

  componentDidMount() {
    console.log('componentDidMount');
    const $window = $(window);
    const $blurred = $('.blurred');
    $(() => {
      html2canvas(document.body).then((canvas) => {
        $('#html2canvas').append(canvas);
        $('canvas').attr('id', 'canvas');
        const width = $(window).width();
        const body = document.body;
        const html = document.documentElement;
        const height = Math.max(body.scrollHeight, body.offsetHeight,
          html.clientHeight, html.scrollHeight, html.offsetHeight);
        try {
          StackBlur.canvasRGB(canvas, 0, 0, width, height, 20);
          const scrollIframe = () => {
            $blurred.find('canvas').css({
              top: -$blurred.offset().top,
            });
          };
          scrollIframe();
          $window.on('scroll', scrollIframe);
        } catch (err) {
          console.warn('blur err', err);
          console.log('fallback to vaguejs');
          $blurred.find('canvas').replaceWith(`<iframe id="blurFrame" style="dipslay:none;" width="${width}" height="${height}" frameborder="0" scrolling="no" src="${window.location.href}"></iframe>`);
          const vague = $blurred.find('iframe').Vague({ intensity: 5 });
          vague.blur();

          const scrollIframe = () => {
            $blurred.find('#blurFrame').css({
              top: -$blurred.offset().top,
            });
          };
          scrollIframe();
          $window.on('scroll', scrollIframe);
        }
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps', nextProps);
    if (this.props.xp.score !== nextProps.xp.score || this.props.xp.text !== nextProps.xp.text) {
      if (this.state.show) {
        this.setState({
          textAnimate: styles.bounceOutUp,
          scoreAnimate: styles.bounceOutUp,
        }, () => {
          setTimeout(() => {
            this.setState({
              textAnimate: styles.bounceInUp,
              scoreAnimate: styles.bounceInRight,
            });
          }, 1000);
        });
      } else {
        this.state = {
          scoreAnimate: styles.bounceInRight,
          textAnimate: styles.bounceInUp,
          show: true,
        };
      }
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
            +<CountUp start={0} end={this.props.xp.score} redraw={false} /> XP
        </div>
          <div id="html2canvas" />
        </div>
      </div>
    );
  }
}

Xp.propTypes = {
  xp: PropTypes.object.isRequired,
  scale: PropTypes.number.isRequired,
};

export default Radium(Xp);
