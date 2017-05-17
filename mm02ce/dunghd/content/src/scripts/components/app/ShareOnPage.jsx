import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys, compose } from 'recompose';
import iconImage from './images/dog_blue.png';
import logger from '../utils/logger';

// borrow code from https://github.com/estevanmaito/sharect
function ShareButton(icon, clickFn) {
  const btn = document.createElement('div');
  btn.style = 'display:inline-block;'
    + 'margin:7px;'
    + 'cursor:pointer;'
    + 'transition:all .2s ease-in-out;';
  btn.innerHTML = icon;
  btn.onclick = clickFn;
  btn.onmouseover = function onmouseover() {
    this.style.transform = 'scale(1.2)';
  };
  btn.onmouseout = function onmouseout() {
    this.style.transform = 'scale(1)';
  };
  return btn;
}

function MaomaoShare() {
  const settings = {
    isReady: true,
  };
  const imgSize = 50;
  const iconConfig = {
    icon: `<img width="${imgSize}" height="${imgSize}" src="${iconImage}" alt="maomao share" />`,
  };

  let selection = '';
  let text = '';
  let backgroundColor = '#333';
  let iconColor = '#fff';
  const containterSize = 64;

  let icons = {};
  const SharebuttonMargin = 7 * 2;
  const iconSize = imgSize + SharebuttonMargin;
  let top = 0;
  let left = 0;

  function maomaoShareButton() {
    const btn = new ShareButton(iconConfig.icon, () => {
      settings.onShare(text);
      return false;
    });

    return btn;
  }

  function appendIconStyle() {
    const style = document.createElement('style');
    style.innerHTML = `.maomaoshare__icon{fill:${iconColor};}`;
    document.body.appendChild(style);
  }

  function appendIcons() {
    const div = document.createElement('div');
    let count = 0;
    div.appendChild(maomaoShareButton());
    count += 1;

    return {
      icons: div,
      length: count,
    };
  }

  function getSelectionParentElementPosition() {
    let parentEl = selection.getRangeAt(0).commonAncestorContainer;
    if (parentEl.nodeType !== 1) {
      parentEl = parentEl.parentNode;
    }
    return parentEl.getBoundingClientRect();
  }

  function setTooltipPosition() {
    const position = getSelectionParentElementPosition();
    const textPosition = selection.getRangeAt(0).getBoundingClientRect();
    const DOCUMENT_SCROLLTOP = window.pageXOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    top = (position.top + DOCUMENT_SCROLLTOP + position.height) - iconSize;
    // HOTFIX: when top positio is too far with text selection
    const textDistance = (textPosition.bottom + DOCUMENT_SCROLLTOP) - iconSize;
    if (top > textDistance) {
      top = textDistance;
    }
    left = position.left - iconSize - 10;
    // detect position left or right of paragraph
    logger.info('left top', left, top, containterSize);
  }

  function moveTooltip() {
    setTooltipPosition();
    const tooltip = document.querySelector('.maomaoshare');
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  function drawTooltip() {
    icons = appendIcons();
    setTooltipPosition(containterSize);
    const div = document.createElement('div');
    div.className = 'maomaoshare';
    div.style = `${'line-height:0;'
      + 'position:absolute;'
      + 'background-color:'}${backgroundColor};`
      + 'border-radius:6px;'
      + `top:${top}px;`
      + `display:${settings.isReady ? 'block' : 'none'};`
      + `left:${left}px;`
      + 'z-index: 9999;'
      + `width: ${containterSize}px;`
      + `height: ${containterSize}px;`
      + 'animation: vex-flyin 0.5s;'
      + 'transition:all .2s ease-in-out;'
      + 'box-shadow: rgba(0, 0, 0, 0.188235) 0px 10px 30px, rgba(0, 0, 0, 0.227451) 0px 6px 10px;';

    div.appendChild(icons.icons);
    document.body.appendChild(div);
  }

  function handleEvent() {
    function hasSelection() {
      const selectText = window.getSelection().toString().trim();
      return !!selectText && selectText.length > 0;
    }
    function hasTooltipDrawn() {
      return !!document.querySelector('.maomaoshare');
    }
    setTimeout(() => {
      if (hasTooltipDrawn()) {
        if (hasSelection()) {
          selection = window.getSelection();
          text = selection.toString();
          moveTooltip();
          return;
        }
        document.querySelector('.maomaoshare').remove();
      }
      if (hasSelection()) {
        selection = window.getSelection();
        text = selection.toString();
        drawTooltip();
      }
    }, 10);
  }

  function attachEvents() {
    window.addEventListener('mouseup', handleEvent, false);
  }

  function config(options) {
    settings.isReady = options.isReady === undefined
      ? settings.isReady
      : options.isReady;
    settings.onShare = typeof options.onShare === 'function' ? options.onShare : () => { };
    backgroundColor = options.backgroundColor || '#333';
    iconColor = options.iconColor || '#fff';
    return this;
  }

  function init() {
    appendIconStyle();
    attachEvents();
    return this;
  }

  return {
    config,
    init,
  };
}


const propTypes = {
  isReady: PropTypes.bool.isRequired,
  openShare: PropTypes.func.isRequired,
};

const defaultProps = {
  isReady: false,
  openShare: () => { },
};

const share = new MaomaoShare();
/* ShareOnPage pure component */
function ShareOnPage({ isReady, openShare }) {
  logger.info('ShareOnPage isReady', isReady);
  share.config({
    backgroundColor: 'rgba(242, 242, 242, 0.7)',
    arrowSize: 10,
    onShare: openShare,
    isReady,
  }).init();
  return (
    <div />
  );
}

ShareOnPage.propTypes = propTypes;
ShareOnPage.defaultProps = defaultProps;

const enhance = compose(
  onlyUpdateForKeys(['isReady']),
);

export default enhance(ShareOnPage);
