import React from 'react';
import { compose, pure } from 'recompose';
import styled from 'styled-components';
import noImage from './images/no-image.png';

const Wrapper = styled.div`
  height: 40px;
  width: 170px;
  float: left;
  background: #fff;
  margin: 10px !important;
  &:hover {
    background: #dedede;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }
`;
const Image = styled.span`
  float: left;
  width: 50px;
`;
const Info = styled.ul`
  float: right;
  width: 120px;
  text-align: left;
`;
const Item = styled.li`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
`;

const Contact = ({ onClick, name, email, image }) =>
  <Wrapper onClick={onClick}>
    <Image>
      <img onError={(ev) => { ev.target.src = noImage; }} src={image} alt={name || email} height="40" width="40" />
    </Image>
    <Info>
      {name && name.length > 0 &&
      <Item>{name}</Item>
      }
      <Item>{email}</Item>
    </Info>
  </Wrapper>;

const enhance = compose(
  pure,
);

export default enhance(Contact);
