import React, { Component, PropTypes } from 'react';
import CountUp from 'react-countup';
import { bounceInUp, bounceInRight } from 'react-animations';
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
};

class Xp extends Component {
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
          $('canvas').replaceWith(`<iframe width="${width}" height="${height}" frameborder="0" scrolling="no" src="${window.location.href}"></iframe>`);
          const vague = $blurred.find('iframe').Vague({ intensity: 5 });
          vague.blur();

          const scrollIframe = () => {
            $blurred.find('iframe').css({
              top: -$blurred.offset().top,
            });
          };
          $window.on('scroll', scrollIframe);
          scrollIframe();
        }
      });
    });
  }
  render() {
    const dummies = Object.keys(styles).map(
      key => <span key={key} style={styles[key]} />,
    );
    return (
      <div className="blurred" style={{ display: this.props.xp.score ? 'block' : 'none' }}>
        <ToggleDisplay if={this.props.xp.score > 0}>
          {dummies}
          <div style={styles.bounceInUp} className="nlp_topic">{this.props.xp.text}</div>
          <div
            style={styles.bounceInRight}
            className="nlp_score"
          >
            +<CountUp start={0} end={this.props.xp.score} /> XP
        </div>
        </ToggleDisplay>
        <div id="html2canvas" />
      </div>
    );
  }
}

Xp.propTypes = {
  xp: PropTypes.object.isRequired,
};

export default Radium(Xp);
