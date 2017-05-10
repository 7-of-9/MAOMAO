import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys, compose } from 'recompose';
import iconImage from './images/dog_blue.png';
import logger from '../utils/logger';

// borrow code from https://github.com/estevanmaito/maomaoshare
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
  const iconConfig = {
    icon: `<img width="24" height="24" src="${iconImage}" alt="maomao share" />`,
  };

  let selection = '';
  let text = '';
  let backgroundColor = '#333';
  let iconColor = '#fff';

  let icons = {};
  const arrowSize = 5;
  const SharebuttonMargin = 7 * 2;
  const iconSize = 24 + SharebuttonMargin;
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

  function setTooltipPosition() {
    const position = selection.getRangeAt(0).getBoundingClientRect();
    const DOCUMENT_SCROLLTOP = window.pageXOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    top = (position.top + DOCUMENT_SCROLLTOP) - iconSize - arrowSize;
    left = position.left + ((position.width - (iconSize * icons.length)) / 2);
  }

  function moveTooltip() {
    setTooltipPosition();
    const tooltip = document.querySelector('.maomaoshare');
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  function drawTooltip() {
    icons = appendIcons();
    setTooltipPosition();

    const div = document.createElement('div');
    div.className = 'maomaoshare';
    div.style = `${'line-height:0;'
      + 'position:absolute;'
      + 'background-color:'}${backgroundColor};`
      + 'border-radius:6px;'
      + `top:${top}px;`
      + `display:${settings.isReady ? 'block' : 'none'};`
      + `left:${left}px;`
      + 'z-index: 999;'
      + 'animation: vex-flyin 0.5s;'
      + 'transition:all .2s ease-in-out;'
      + 'box-shadow: rgba(0, 0, 0, 0.188235) 0px 10px 30px, rgba(0, 0, 0, 0.227451) 0px 6px 10px;';

    div.appendChild(icons.icons);

    const arrow = document.createElement('div');
    arrow.style = `${'position:absolute;'
      + 'border-left:'}${arrowSize}px solid transparent;`
      + `border-right:${arrowSize}px solid transparent;`
      + `border-top:${arrowSize}px solid ${backgroundColor};`
      + `bottom:-${arrowSize - 1}px;`
      + `left:${((iconSize * icons.length) / 2) - arrowSize}px;`
      + 'width:0;'
      + 'height:0;';

    div.appendChild(arrow);

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
  logger.warn('ShareOnPage isReady', isReady);
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
