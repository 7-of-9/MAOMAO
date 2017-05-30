import PropTypes from 'prop-types';
import { onlyUpdateForKeys, compose } from 'recompose';
import iconImage from './images/dog_blue.png';
import logger from '../utils/logger';

//  https://github.com/LyraDesigns/imgPin/blob/master/jquery.imgPin.js

function ShareButton(position, isReady, clickFn) {
  const btn = document.createElement('a');
  btn.style = `display:${isReady ? 'block' : 'none'};`;
  const icon = `<img class="mm-share-icon" src="${iconImage}" alt="maomao share" />`;
  btn.className = `pin ${position}`;
  btn.innerHTML = icon;
  btn.onclick = clickFn;
  return btn;
}

function MaoMaoImgPin() {
  let position = '';
  const settings = {
    isReady: true,
  };

  function config(options) {
    settings.isReady = options.isReady === undefined
      ? settings.isReady
      : options.isReady;
    settings.onShare = typeof options.onShare === 'function' ? options.onShare : () => { };

    switch (options.position) {
      case 1:
        position = 'top left';
        break;
      case 2:
        position = 'top right';
        break;
      case 3:
        position = 'bottom right';
        break;
      case 4:
        position = 'bottom left';
        break;
      default:
        position = 'top left';
    }

    return this;
  }

  function appendStyle() {
    const style = document.createElement('style');
    style.innerHTML = `
      .MaomaoImgPinWrap {
        position: relative;
        display: inline-block;
      }

      .MaomaoImgPinWrap .pin {
        z-index:100;
        opacity: 0;
        position: absolute;
        display: block;
        cursor: pointer;
        -webkit-transition:all .25s ease-in-out;
        -moz-transition:all .25s ease-in-out;
        -o-transition:all .25s ease-in-out;
        transition:all .25s ease-in-out;
      }
      .MaomaoImgPinWrap .pin img {
        display: block;
      }

      .MaomaoImgPinWrap .pin .mm-share-icon {
        width: 40px;
        height: 40px;
      }
      .MaomaoImgPinWrap .pin:hover {
        box-shadow: 0 0 5px #fff;
      }

      .MaomaoImgPinWrap:hover .pin {
        opacity: 1;
      }

      .MaomaoImgPinWrap .left { left: 15px; }
      .MaomaoImgPinWrap .right { right: 15px; }
      .MaomaoImgPinWrap .bottom { bottom: 15px; }
      .MaomaoImgPinWrap .top { top: 15px; }
    `;
    document.body.appendChild(style);
  }

  function maomaoShareButton() {
    const btn = new ShareButton(position, settings.isReady, () => {
      settings.onShare();
      return false;
    });

    return btn;
  }

  function wrapElement(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }


  function attachEvents() {
    if (settings.isReady) {
      const imgs = document.getElementsByTagName('img');
      const forEach = Array.prototype.forEach;
      const MIN_WIDTH = 100;
      const MIN_HEIGHT = 100;
      // only show hover image if their demension > 100x100
      forEach.call(imgs, (img) => {
        if (img.width > MIN_WIDTH && img.height > MIN_HEIGHT && img.className !== 'mm-share-icon' && img.parentNode.className.indexOf('pin') === -1) {
          logger.info('img', img);
          const wrapper = document.createElement('div');
          wrapper.style = `width: ${img.width}px; height: ${img.height}px;`;
          wrapper.className = 'MaomaoImgPinWrap';
          wrapElement(img, wrapper);
          wrapper.appendChild(maomaoShareButton());
        }
      });
    }
  }

  function init() {
    appendStyle();
    attachEvents();
    return this;
  }

  return {
    config,
    init,
  };
}

const share = new MaoMaoImgPin();

function ShareOnHoverImage({ isReady, openShare, position }) {
  logger.info('ShareOnHoverImage isReady', isReady, position);
  // TODO: allow to change position base on debug menu
  if (isReady) {
    share.config({
      onShare: openShare,
      position,
      isReady,
    }).init();
  }
  return null;
}

const propTypes = {
  isReady: PropTypes.bool.isRequired,
  openShare: PropTypes.func.isRequired,
  position: PropTypes.number,
};

const defaultProps = {
  isReady: false,
  position: 1,
  openShare: () => { },
};

ShareOnHoverImage.propTypes = propTypes;
ShareOnHoverImage.defaultProps = defaultProps;

const enhance = compose(
  onlyUpdateForKeys(['isReady']),
);

export default enhance(ShareOnHoverImage);

