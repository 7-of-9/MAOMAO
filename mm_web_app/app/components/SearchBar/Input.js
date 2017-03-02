import styled from 'styled-components';

import searchIcon from './images/search-icon.svg';

const InputWrapper = styled.div`
  background-image: url(${searchIcon});
  background-position: 12px 7px;
  background-repeat: no-repeat;
  background-size: 29px 26px;
  height: 40px;
  padding-left: 44px;
  background-color: #efefef;
  border: none;
  border-radius: 4px;
`;

const InputContainer = styled.div`
  text-align: left;
  color: rgb(33, 25, 34);
  height: 40px;
`;

export { InputWrapper, InputContainer };
