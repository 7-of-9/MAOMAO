import React from 'react'
import PropTypes from 'prop-types'
import { compose, onlyUpdateForKeys } from 'recompose'
import styled from 'styled-components'
import noImage from './images/no-image.png'
import removeIcon from './images/minus.png'

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
`
const Image = styled.span`
  float: left;
  width: 50px;
`
const Info = styled.ul`
  float: right;
  width: 120px;
  height: 50px;
  text-align: left;
`
const Item = styled.li`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  font-size: 11px !important;
`

const Remove = styled.a`
  &:hover {
    background: #dedede;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }
`

/* eslint-disable no-param-reassign */
const Contact = ({ onClick, name, email, image, isEdit, onRemove }) =>
  <Wrapper onClick={onClick} className='share-contact'>
    <Image className='share-contact-img'>
      <amp-img
        onError={(ev) => { ev.target.src = noImage }}
        src={image}
        alt={name || email}
        height='40'
        width='40'
        layout='fixed'
      />
    </Image>
    <Info className='share-info'>
      {name && name.length > 0 &&
      <Item>{name}</Item>
      }
      <Item>{email}</Item>
      {
        isEdit && <Remove className='account-remove' onClick={onRemove} ><amp-img layout='fixed' style={{ width: '20px', height: '20px', float: 'right' }} src={removeIcon} alt='Remove' /></Remove>
      }
    </Info>
  </Wrapper>

Contact.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  image: PropTypes.string,
  isEdit: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func
}

Contact.defaultProps = {
  name: '',
  email: '',
  image: '',
  isEdit: false,
  onClick: () => {},
  onRemove: () => {}
}

const enhance = compose(
  onlyUpdateForKeys(['name', 'email', 'image'])
)

export default enhance(Contact)
