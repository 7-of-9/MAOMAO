import React from 'react'
import PropTypes from 'prop-types'
import { onlyUpdateForKeys, compose } from 'recompose'
import Button from './Button'

const button = (img, active, onClick) => (
  <Button primary={active} onClick={onClick} />
)

const style = {
  toolbar: {
    float: 'right',
    padding: '0 10px'
  }
}

const enhance = compose(
  onlyUpdateForKeys(['active'])
)

const Toolbar = enhance(({ active, onChange }) =>
  <div style={style.toolbar}>
    {button('/static/images/google.svg', active === 'Google', () => onChange('Google'))}
    {button('/static/images/facebook.svg', active === 'Facebook', () => onChange('Facebook'))}
    {button('/static/images/facebook-messenger.svg', active === 'FacebookMessenger', () => onChange('FacebookMessenger'))}
    {button('/static/images/link.svg', active === 'Link', () => onChange('Link'))}
  </div>
)

Toolbar.propTypes = {
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default Toolbar
