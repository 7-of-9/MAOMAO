import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import BlockElement from '../components/BlockElement'
import DiscoveryButton from '../components/DiscoveryButton'
import ShareTopic from '../components/ShareTopic'
import FilterSearch from '../components/FilterSearch'
import Header from '../components/Header'
import LogoIcon from '../components/LogoIcon'
import Slogan from '../components/Slogan'
import Loading from '../components/Loading'
import UnlockNow from '../components/UnlockNow'
import SearchBar from '../components/SearchBar'
import Footer from '../components/Footer'
import AddToHome from '../components/AddToHome'

storiesOf('Header', module)
  .add('with logo & slogan', () => (
    <Header><LogoIcon /><Slogan /></Header>
  ))

storiesOf('Footer', module)
  .add('default props', () => (
    <Footer />
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
      image='https://i.ytimg.com/vi/8LVN7WVgx0c/mqdefault.jpg'
      name='Top 5 - Technology That Has Changed The World'
      type='Youtube'
      description='jaw dropping halloween deals(upto 90% off) = http://amzn.to/1jc8At9. Technology has changed the...'
      url='https://www.youtube.com/watch?v=8LVN7WVgx0c'
      />
  ))

storiesOf('FilterSearch', module)
  .add('default props', () => (
    <FilterSearch
      rating={1}
      urls={[]}
      topics={[]}
      users={[]}
      filterByTopic={[]}
      filterByUser={[]}
      onChangeRate={action('onChangeRate')}
      onSelectTopic={action('onSelectTopic')}
      onRemoveTopic={action('onRemoveTopic')}
      onSelectUser={action('onSelectUser')}
      onRemoveUser={action('onRemoveUser')}
    />
  ))
