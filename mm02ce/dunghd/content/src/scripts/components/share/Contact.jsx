import React from 'react';
import { compose, pure } from 'recompose';
import styled from 'styled-components';
import noImage from './images/no-image.png';

const Wrapper = styled.div`
  height: 45px;
  width: 170px;
  float: left;
  background: #fff;
  margin: 10px !important;
`;
const Image = styled.span`
  float: left;
  width: 50px;
`;
const Info = styled.ul`
  float: right;
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
`;

const Contact = ({ name, email, image }) =>
  <Wrapper>
    <Image>
      <img onError={(ev) => { ev.target.src = noImage; }} src={image} alt={name || email} height="40" width="40" />
    </Image>
    <Info>
      {name && name.length > 0 &&
      <li>{name}</li>
      }
      <li>{email}</li>
    </Info>
  </Wrapper>;

const enhance = compose(
  pure,
);

export default enhance(Contact);
