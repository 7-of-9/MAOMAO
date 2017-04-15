/**
*
* ChromeInstall
*
*/

import React from 'react'
import styled from 'styled-components'
import { Hero, HorizontalSplit, Section } from 'neal-react'
import * as logger from 'loglevel'
import UnlockNow from '../../components/UnlockNow'

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

function ChromeInstall ({ title, description, install, isInstall, isLogin }) {
  logger.warn('ChromeInstall isInstall, isLogin', isInstall, isLogin)
  return (
    <Wrapper>
      <Hero className='text-xs-center'>
        <h1>{description}</h1>
        {!isInstall && <UnlockNow install={install} title={title} /> }
        {!isInstall && <AddToChrome onClick={install}><i className='fa fa-plus' aria-hidden='true' /> ADD TO CHROME</AddToChrome> }
        {!isInstall && <Share><i className='fa fa-share-alt' aria-hidden='true' /></Share> }
      </Hero>
      <Section>
        <HorizontalSplit padding='md'>
          <div>
            <p className='lead'>What is Maomao?</p>
            <p>Maomao is a solution for friends to automatically share content with each other on a specific topic of shared interest.</p>
            <p>For example, I might share <strong>US Politics</strong> and <strong>Global Tech > Startups</strong> with one work colleague, <strong>Software > Agile</strong> and <strong>Music > Kpop</strong> with a different work colleague; <strong>Medical Music > Classical Music</strong> with an elderly parent. The permutations are uniquely personalised between peers in the Maomao social graph.</p>
            <p>Maomao overcomes distance and communication barriers: it amplifies enjoyment and consumption of high quality web content, using AI to let friends rediscover and enjoy content from each other in real time, no matter where they are and <strong>without any effort or input</strong> from each other.</p>
            <p>It’s a radical reimagining of what sharing can be, always in the complete control of users: it’s safe, automatic and intelligent, highlighting only the best and most relevant content to friends.</p>
            <p>Because Maomao learns intimately each user’s unique preferences and likes, it also surfaces new and contextually related parts of the internet for users. It’s like a smart, <strong>personalised and proactive search engine.</strong></p>
          </div>
          <div>
            <p className='lead'>How does it work?</p>
            <p>We use natural language processing, correlation analysis and a real time learning engine to categorise web content as it is browsed. We suggest and then setup real time topic sharing between users on the platform, so users can view each others topic streams - both past and future content is automatically shared once both users accept the shared stream.</p>
          </div>
        </HorizontalSplit>
      </Section>
      <Section>
        <HorizontalSplit padding='md'>
          <div>
            <p className='lead'>What stage are we at?</p>
            <p>We are in stealth mode, and developing towards private alpha testing phase. We have and end-to-end technical proof of concept in place, working on desktop web.</p>
          </div>
          <div>
            <p className='lead'>Who are we??</p>
            <p>Maomao is founded by a lifelong technologist with twenty years experience: from global tech and finance giants through to most recently an fin-tech startup that attracted several rounds of tier-one Silicon Valley VC investment. Our distributed development team is in APAC region.</p>
          </div>
        </HorizontalSplit>
      </Section>
    </Wrapper>
  )
}

ChromeInstall.propTypes = {
  install: React.PropTypes.func,
  title: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  isInstall: React.PropTypes.bool.isRequired,
  isLogin: React.PropTypes.bool.isRequired
}

export default ChromeInstall
