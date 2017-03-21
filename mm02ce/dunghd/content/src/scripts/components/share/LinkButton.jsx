import styled from 'styled-components';

import Button from './Button';
import linkIcon from './images/link.svg';

const LinkButton = styled(Button)`
  background-image: url(${linkIcon});
`;

export default LinkButton;
