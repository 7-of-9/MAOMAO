/**
*
* Block
*
*/

import React from 'react';
import Masonry from 'masonry-layout';

const TIME_TO_RELOAD = 1000; // 1s

function Block(WrappedComponent) {
  return class extends React.Component { // eslint-disable-line react/prefer-stateless-function

    componentDidMount() {
      this.layer = new Masonry(this.container, {
        fitWidth: true,
        columnWidth: 240,
        gutter: 10,
        itemSelector: '.grid-item',
      });
      // Fix position layer
      this.timer = setInterval(() => {
        if (this.container) {
          this.layer = new Masonry(this.container, {
            fitWidth: true,
            columnWidth: 240,
            gutter: 10,
            itemSelector: '.grid-item',
          });
        }
      }, TIME_TO_RELOAD);
    }

    componentDidUpdate() {
      // Fix position when loading image
      this.layer = new Masonry(this.container, {
        fitWidth: true,
        columnWidth: 240,
        gutter: 10,
        itemSelector: '.grid-item',
      });
    }

    componentWillUnmount() {
      clearInterval(this.timer);
    }

    render() {
      return (
        <div className="grid" ref={(element) => { this.container = element; }} >
          <WrappedComponent {...this.props} />
        </div>
      );
    }
  };
}

export default Block;
