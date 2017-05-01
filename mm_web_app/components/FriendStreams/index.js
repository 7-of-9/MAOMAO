/**
*
* YourStreams
*
*/

import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import logger from '../../utils/logger'

// import _ from 'lodash'

var options = [
  { value: 'one', label: 'Topic One' },
  { value: 'two', label: 'Topic Two' }
]

function logChange (val) {
  console.log('Selected: ' + val)
}

function FriendStreams ({ friends }) {
  logger.warn('friends', friends)
  return (
    <div className='container'>
      <div className='ReactTabs react-tabs'>
        <div className='ReactTabs__TabPanel ReactTabs__TabPanel--selected' role='tabpanel' id='react-tabs-1'>
          <div className='standand-sort'>
            <nav className='navbar'>
              <ul className='nav navbar-nav'>
                <li>
                  <div>
                    <span>>Topic</span>
                    <Select
                      name='user-name'
                      value=''
                      options={options}
                      onChange={logChange}
                        />
                  </div>
                </li>
                <li>
                  <div className='input-group'>
                    <input type='text' className='form-control' placeholder='Search URL ...' />
                  </div>
                </li>
              </ul>
            </nav>
          </div>
          <div className='container-masonry' />
        </div>
      </div>
    </div>
  )
}

FriendStreams.propTypes = {
  friends: PropTypes.array.isRequired
}

export default FriendStreams
