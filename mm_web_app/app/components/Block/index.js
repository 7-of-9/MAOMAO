/**
*
* Block
*
*/

import React from 'react';
import Masonry from 'masonry-layout';

function Block(WrappedComponent) {
  return class extends React.Component { // eslint-disable-line react/prefer-stateless-function

    componentDidMount() {
      this.layer = new Masonry(this.container, {
        fitWidth: true,
        columnWidth: 240,
        gutter: 10,
        itemSelector: '.grid-item',
      });
      // Fix position when loading image
      setTimeout(() => {
        this.layer = new Masonry(this.container, {
          fitWidth: true,
          columnWidth: 240,
          gutter: 10,
          itemSelector: '.grid-item',
        });
      }, 1000);
    }

    componentDidUpdate() {
      // Fix position when loading image
      this.layer = new Masonry(this.container, {
        fitWidth: true,
        columnWidth: 240,
        gutter: 10,
        itemSelector: '.grid-item',
      });
      setTimeout(() => {
        this.layer = new Masonry(this.container, {
          fitWidth: true,
          columnWidth: 240,
          gutter: 10,
          itemSelector: '.grid-item',
        });
      }, 1000);
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
