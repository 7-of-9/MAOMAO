import styled from 'styled-components';
import icon from './images/loading.svg';

const Loading = styled.img`
  background-color: transparent;
  background-image: url(${icon});
  background-repeat: no-repeat;
  background-size: contain;
  width: 50px;
  height: 50px;
`;

export default Loading;
