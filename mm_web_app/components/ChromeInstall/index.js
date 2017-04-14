/**
*
* ChromeInstall
*
*/

import React from 'react'
import styled from 'styled-components'
import {
   Hero, HorizontalSplit, Section
} from 'neal-react'
import UnlockNow from '../../components/UnlockNow'
import { hasInstalledExtension } from '../../utils/chrome'

const Wrapper = styled.div`
  text-align: center;
`

const AddToChrome = styled.button`
 margin-left: 40px;
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`

const Share = styled.button`
 margin-left: 1px;
 padding: 0.5em 1em;
 background: #1b7ac5;
 color: #fff;
`

function ChromeInstall ({ title, install }) {
  return (
    <Wrapper style={{ display: hasInstalledExtension() ? 'none' : '' }}>
      <Hero className='text-xs-center'>
        <UnlockNow install={install} title={title} hasInstalled={hasInstalledExtension()} />
        <AddToChrome onClick={install}><i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</AddToChrome>
        <Share><i className='fa fa-share-alt' aria-hidden='true' /></Share>
      </Hero>
      <Section>
        <HorizontalSplit padding='md'>
          <div>
            <p className='lead'>Batteries Included</p>
            <p>Neal is based on <a href='http://v4-alpha.getbootstrap.com/' target='_blank'>Bootstrap 4</a> and ships with navbar, hero, footer, sections, horizontal split, pricing tables, customer quotes and other components you need for a landing page. No more repetitive coding! Oh, and it's easy to extend.</p>
          </div>
          <div>
            <p className='lead'>Third-Party Integrations</p>
            <p>External integrations like &nbsp
              <a href='http://www.google.com/analytics/'>Google Analytics</a>,&nbsp
              <a href='https://segment.com/'>Segment</a>,&nbsp
              <a href='https://stripe.com/'>Stripe</a> and&nbsp
              <a href='http://typeform.com'>Typeform</a> are included.
              No more copying & pasting integration code, all you need is your API keys. We automatically track events when visitors navigate to different parts of your page.</p>
          </div>
          <div>
            <p className='lead'>Serverless Deployment</p>
            <p>Because you are relying on react.js and third-party integration you don't need a server to host your landing page. Simply upload it to an Amazon S3 bucket, enable website hosting, and it's ready to go!</p>
          </div>
        </HorizontalSplit>
      </Section>
    </Wrapper>
  )
}

ChromeInstall.propTypes = {
  install: React.PropTypes.func,
  title: React.PropTypes.string.isRequired
}

export default ChromeInstall
