import styled from 'styled-components'

const Button = styled.button`
  background-color: transparent;
  background-repeat: no-repeat;
  background-size: contain;
  width: 35px;
  height: 35px;
  border: ${props => props.primary ? '1px solid #607d8b' : '0'};
  margin: 0.5em;
  &:hover {
    cursor: pointer;
  }
`

export default Button
