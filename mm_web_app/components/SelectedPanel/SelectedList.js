/**
*
* SearchBar
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import SelectedItem from './SelectedItem'

class SelectedList extends React.PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired,
    onRemove: PropTypes.func.isRequired
  }

  static defaultProps = {
    items: [],
    onRemove: (id, name) => {}
  }

  render () {
    const { items } = this.props
    return (
      <div className='input-group'>
        <div className='search-box-drop'>
          <ul className='search-box-list'>
            {
              items.map(({name, id}) => (
                <SelectedItem
                  name={name}
                  id={id}
                  key={`${id}-${name}`}
                  onRemove={this.props.onRemove}
                />
              ))
              }
          </ul>
        </div>
      </div>
    )
  }
}

export default SelectedList
