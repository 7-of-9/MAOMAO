/**
*
* DiscoveryButton
*
*/

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import iconImg from './images/discovery-icon.png';

const Wrapper = styled.div`
  margin: 0 10px;
  float: right;
`;

const Image = styled.img`
  width: 40px;
  height: 40px;
`;

function DiscoveryButton({ keys }) {
  let link = '/discovery';
  if (keys) {
    link = `/discovery?search=${keys}`;
  }
  return (
    <Wrapper>
      <Link to={link}>
        <Image src={iconImg} alt="Discovery" />
      </Link>
    </Wrapper>
  );
}

DiscoveryButton.propTypes = {
  keys: React.PropTypes.string,
};

export default DiscoveryButton;
