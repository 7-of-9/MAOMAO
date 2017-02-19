/**
*
* Block
*
*/

import React, { PropTypes } from 'react';
import Bricklayer from 'bricklayer';
// import styled from 'styled-components';


class Block extends React.Component { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.bricklayer = new Bricklayer(this.container);
  }

  render() {
    return (<div className="bricklayer" ref={(element) => { this.container = element; }}>
      {this.props.children}
    </div>);
  }
}

Block.propTypes = {
  children: PropTypes.node,
};

export default Block;
