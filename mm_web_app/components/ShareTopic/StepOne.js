import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import ShareOptions from './ShareOptions'
import fbScrapeShareUrl from '../../utils/fb'

const SITE_URL = 'https://maomaoweb.azurewebsites.net'
const selectUrl = (code, shareOption) => code[shareOption]

const StepOne = compose(({
   type, code, shareOption, topics, changeShareType
  }) => (
    <div>
      <ShareOptions
        active={shareOption}
        topics={topics}
        onChange={(value) => { changeShareType(type, value, 1) }}
      />
      <div className='share-footer'>
        <button
          className='btn btn-slide-next'
          onClick={() => {
            const url = `${SITE_URL}/${selectUrl(code, shareOption)}`
            fbScrapeShareUrl(url)
            changeShareType(type, shareOption, 2)
          }}
        >
          Next
        </button>
      </div>
    </div>
  ))

StepOne.propTypes = {
  type: PropTypes.string.isRequired,
  code: PropTypes.object.isRequired,
  topics: PropTypes.array.isRequired,
  shareOption: PropTypes.string.isRequired,
  changeShareType: PropTypes.func.isRequired
}

export default StepOne
