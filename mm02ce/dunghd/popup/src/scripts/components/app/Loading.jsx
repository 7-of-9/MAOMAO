import styled from 'styled-components';
import icon from './images/loading.svg';

const Loading = styled.img`
  background-color: transparent;
  background-image: url(${icon});
  background-repeat: no-repeat;
  background-size: contain;
  width: 120px;
  height: 120px;
`;

export default Loading;
