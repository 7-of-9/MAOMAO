import React from 'react';
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

function MaomaoShare(onShare) {
  const networks = {
    maomao: true,
  };
  const maomaoConfig = {
    ready: false,
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
    const btn = new ShareButton(maomaoConfig.icon, () => {
      onShare(text);
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
    if (networks.maomao) {
      div.appendChild(maomaoShareButton());
      count += 1;
    }

    return {
      icons: div,
      length: count,
    };
  }

  function setTooltipPosition() {
    const position = selection.getRangeAt(0).getBoundingClientRect();
    logger.warn('setTooltipPosition position', position.top, position.left);
    const DOCUMENT_SCROLLTOP = window.pageXOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    logger.warn('setTooltipPosition DOCUMENT_SCROLLTOP', DOCUMENT_SCROLLTOP);
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
      + `left:${left}px;`
      + 'z-index: 999;'
      + 'animation: vex-flyin 0.5s;'
      + 'transition:all .2s ease-in-out;';

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

  function attachEvents() {
    function hasSelection() {
      const selectText = window.getSelection().toString().trim();
      return !!selectText && selectText.length > 0;
    }

    function hasTooltipDrawn() {
      return !!document.querySelector('.maomaoshare');
    }

    window.addEventListener('mouseup', () => {
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
    }, false);
  }

  function config(options) {
    networks.maomao = options.maomao === undefined
      ? networks.maomao
      : options.maomao;
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

function ShareOnPage() {
  const share = new MaomaoShare((txt) => {
    logger.warn('text selection', txt);
  });
  share.config({
    backgroundColor: 'rgba(242, 242, 242, 0.7)',
    arrowSize: 10,
  }).init();
  return (
    <div />
  );
}

export default ShareOnPage;
