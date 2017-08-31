import Head from 'next/head'
import Router from 'next/router'
import NProgress from 'nprogress'
import NoSSR from 'react-no-ssr'
import { Footer, Page } from 'neal-react'
import { FACEBOOK_APP_ID, MAOMAO_SITE_URL } from '../../containers/App/constants'
import AppHeader from '../../containers/AppHeader'
import Notification from '../../components/Notification'

Router.onRouteChangeStart = (url) => {
  NProgress.start()
}
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const brandName = 'maomao'
const businessAddress = (
  <address>
    <img src='/static/images/maomao.png' className='logo-image' alt='maomao' />
  </address>
)

export default ({ children, title = 'homepage', description = 'discover & share ' }) => (
  <Page>
    <Head>
      <meta charSet='utf-8' />
      <title>{title}</title>
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-title' content='Maomao' />
      <link rel='shortcut icon' type='image/x-icon' href='/static/favicon.ico' />
      <meta name='description' content={description} />
      <meta name='og:title' content={title} />
      <meta name='og:description' content={description} />
      <meta name='og:image' content={`${MAOMAO_SITE_URL}static/images/logo.png`} />
      <meta name='fb:app_id' content={FACEBOOK_APP_ID} />
      <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
      <meta name='google-site-verification' content='R5eOMNDR503rLLPoq12fEQbVWTWxBWaRYqUJiKasHkk' />
      <link rel='apple-touch-icon' href='/static/images/logo.png' />
      <link rel='icon' href='/static/images/logo.png' />
      <link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/onkinoggpeamajngpakinabahkomjcmk' />
      <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
      <link rel='stylesheet' href='/static/vendors/css/nprogress.css' />
      <link rel='stylesheet' href='/static/vendors/css/addtohomescreen.css' />
      <link rel='stylesheet' href='/static/vendors/css/slabtext.css' />
      <script src='https://code.jquery.com/jquery-3.2.1.slim.min.js' />
      <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
      <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
      <script src='/static/vendors/js/jquery.slabtext.min.js' />
      <script src='/static/vendors/js/jquery.textfill.min.js' />
      <script src='/static/vendors/js/snoowrap-v1.min.js' />
      <script src='/static/vendors/js/addtohomescreen.min.js' />
    </Head>
    <NoSSR>
      <AppHeader />
    </NoSSR>
    { children }
    <Notification />
    <div className='footer-area'>
      <Footer brandName={brandName}
        facebookUrl='https://www.facebook.com/maomao.hiring'
        address={businessAddress}
      />
    </div>
  </Page>
)
