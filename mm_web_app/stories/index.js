import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import BlockElement from '../components/BlockElement'
import DiscoveryButton from '../components/DiscoveryButton'
import ShareTopic from '../components/ShareTopic'
import SelectedPanel from '../components/SelectedPanel'
import Header from '../components/Header'
import LogoIcon from '../components/LogoIcon'
import Slogan from '../components/Slogan'
import Loading from '../components/Loading'
import UnlockNow from '../components/UnlockNow'
import SearchBar from '../components/SearchBar'
import Footer from '../components/Footer'
import AddToHome from '../components/AddToHome'
import AnimateBox from '../components/AnimateBox'

storiesOf('Header', module)
  .add('with logo & slogan', () => (
    <Header><LogoIcon /><Slogan /></Header>
  ))

storiesOf('Footer', module)
  .add('default props', () => (
    <Footer />
  ))

storiesOf('AnimateBox', module)
  .add('default props', () => (
    <AnimateBox
      start={() => <div>Start </div>}
      finish={() => <div>Finish </div>}
      duration={300}
    />
  ))

storiesOf('AddToHome', module)
  .add('default props', () => (
    <AddToHome onClick={action('click')} />
  ))

storiesOf('ShareTopic', module)
  .add('step 1 - all browsing', () => (
    <ShareTopic
      type='Google'
      shareOption='all'
      currentStep={1}
      topics={[{ id: 'tld', name: 'Maomao' }]}
      terms={[]}
      code=''
      sendEmail={action('sendEmail')}
      changeShareType={action('changeShareType')}
      accessGoogleContacts={action('accessGoogleContacts')}
      contacts={[]}
      notify={action('notify')}
      closeShare={action('closeShare')}
      />
  ))
  .add('step 1 - active tld', () => (
    <ShareTopic
      type='Google'
      shareOption='tld'
      currentStep={1}
      topics={[{ id: 'tld', name: 'Maomao' }, { id: 'beta-1', name: 'Technology' }]}
      terms={[]}
      code=''
      sendEmail={action('sendEmail')}
      changeShareType={action('changeShareType')}
      accessGoogleContacts={action('accessGoogleContacts')}
      contacts={[]}
      notify={action('notify')}
      closeShare={action('closeShare')}
      />
  ))
  .add('step 2 - Only share this site with google', () => (
    <ShareTopic
      type='Google'
      shareOption='site'
      currentStep={2}
      topics={[]}
      terms={[]}
      code=''
      sendEmail={action('sendEmail')}
      changeShareType={action('changeShareType')}
      accessGoogleContacts={action('accessGoogleContacts')}
      contacts={[]}
      notify={action('notify')}
      closeShare={action('closeShare')}
      />
  ))
  .add('step 3 - share with google - no contacts', () => (
    <ShareTopic
      type='Google'
      shareOption='tld'
      currentStep={3}
      topics={[{ id: 'tld', name: 'Maomao' }, { id: 'beta-1', name: 'Technology' }]}
      terms={[]}
      code=''
      sendEmail={action('sendEmail')}
      changeShareType={action('changeShareType')}
      accessGoogleContacts={action('accessGoogleContacts')}
      contacts={[]}
      notify={action('notify')}
      closeShare={action('closeShare')}
      />
  ))
  .add('step 3 - share with google contacts', () => (
    <ShareTopic
      type='Google'
      shareOption='tld'
      currentStep={3}
      topics={[{ id: 'tld', name: 'Maomao' }, { id: 'beta-1', name: 'Technology' }]}
      terms={[]}
      code=''
      sendEmail={action('sendEmail')}
      changeShareType={action('changeShareType')}
      accessGoogleContacts={action('accessGoogleContacts')}
      contacts={[{'name': 'Quoc Phi', 'email': 'nguyenbaphi152dn@gmail.com'}, {'name': 'Keith Horwood', 'email': 'keith@stdlib.com'}, {'name': 'chris mitchell', 'email': 'chris.mitchell@jcdsconsulting.com'}, {'name': 'Dang Cong Dao', 'email': 'daoit151@gmail.com'}, {'name': 'ants house', 'email': 'antshousesclub.dn@gmail.com'}]}
      notify={action('notify')}
      closeShare={action('closeShare')}
      />
  ))

storiesOf('DiscoveryButton', module)
  .add('default props', () => (
    <DiscoveryButton keys='maomao' />
  ))

storiesOf('Loading', module)
  .add('default props', () => (
    <Loading isLoading />
  ))

storiesOf('UnlockNow', module)
  .add('default props', () => (
    <UnlockNow title='unlock' install={action('install')} />
  ))

storiesOf('SearchBar', module)
  .add('default props', () => (
    <SearchBar
      terms={[]}
      onSearch={action('onSearch')}
      onChange={action('onChange')}
      />
  ))

storiesOf('SelectedPanel', module)
  .add('default props', () => (
    <SelectedPanel>
      <h1> SelectedPanel </h1>
    </SelectedPanel>
  ))

storiesOf('BlockElement', module)
  .add('default props', () => (
    <BlockElement
      image='http://maomaoweb.azurewebsites.net/static/images/maomao.png'
      name='maomao'
      type='Google'
      description='p2p sharing network'
      url='http://maomao.rocks'
      />
  ))
  .add('Youtube inline player', () => (
    <BlockElement
      image='https://i.ytimg.com/vi/IoGIEoUEw-A/mqdefault.jpg'
      name='10 Things You Need To Know By 30'
      type='Youtube'
      description='10 Things You Need to Know By the Time You Turn 30 Years Old'
      url='https://www.youtube.com/watch?v=IoGIEoUEw-A'
      />
  ))
  .add('Vimeo inline player', () => (
    <BlockElement
      image='https://i.vimeocdn.com/video/642420448_1280x720.webp'
      name='BEYOND NATIVE (NOWNESS Magazine)'
      type='Vimeo'
      description='"A group of rising artists unite for a dynamic show of intercultural creativity"'
      url='https://vimeo.com/223584214'
      />
  ))
