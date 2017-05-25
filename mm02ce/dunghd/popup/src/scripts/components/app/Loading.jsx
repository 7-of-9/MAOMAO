import styled from 'styled-components';
import icon from './images/loading.svg';

const Loading = styled.span`
  background-color: transparent;
  background-image: url(${icon});
  background-repeat: no-repeat;
  background-size: contain;
  width: 50px;
  height: 50px;
  margin: 0 auto;
  border: 0;
  display: inline-block;
`;

export default Loading;
