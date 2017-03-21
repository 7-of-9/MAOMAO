import styled from 'styled-components';

import Button from './Button';
import twitterIcon from './images/twitter.svg';

const TwitterButton = styled(Button)`
  background-image: url(${twitterIcon});
`;

export default TwitterButton;
