/**
*
* Block
*
*/

import React, { PropTypes } from 'react';
import Masonry from 'masonry-layout';


class Block extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.layer = new Masonry(this.container, {
      fitWidth: true,
      columnWidth: 240,
      gutter: 10,
    });
  }

  render() {
    const children = this.props.children;
    return (<div className="grid" ref={(element) => { this.container = element; }}>
      {React.Children.map(children, (child) => <div className="grid-item">{child}</div>)}
    </div>);
  }
}

Block.propTypes = {
  children: PropTypes.node,
};

export default Block;
