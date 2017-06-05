import React from 'react'
import PropTypes from 'prop-types'
import { onlyUpdateForKeys, compose } from 'recompose'
import styled from 'styled-components'
import Button from './Button'

const GoogleButton = styled(Button)`
  float: left;
  background-image: url('/static/images/google.svg');
`
const FacebookButton = styled(Button)`
  float: left;
  background-image: url('/static/images/facebook.svg');
`
const FacebookMessengerButton = styled(Button)`
  float: left;
  background-image: url('/static/images/facebook-messenger.svg');
`
const LinkButton = styled(Button)`
  float: left;
  background-image: url('/static/images/link.svg');
`

const style = {
  toolbar: {
    float: 'right',
    padding: '0 10px'
  }
}

const enhance = compose(
  onlyUpdateForKeys(['active'])
)

const Toolbar = enhance(({ active, onChange, onShare, onSendMsg }) =>
  <div style={style.toolbar}>
    <GoogleButton primary={active === 'Google'} onClick={() => onChange('Google')} />
    <FacebookButton primary={active === 'Facebook'} onClick={onShare} />
    <FacebookMessengerButton primary={active === 'FacebookMessenger'} onClick={onSendMsg} />
    <LinkButton primary={active === 'Link'} onClick={() => onChange('Link')} />
  </div>
)

Toolbar.propTypes = {
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onSendMsg: PropTypes.func.isRequired
}

export default Toolbar
