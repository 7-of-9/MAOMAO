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

storiesOf('Header', module)
  .add('with logo & slogan', () => (
    <Header><LogoIcon /><Slogan /></Header>
  ))

storiesOf('Footer', module)
  .add('default props', () => (
    <Footer />
  ))

storiesOf('ShareTopic', module)
  .add('default props', () => (
    <ShareTopic
      type='Google'
      shareOption='all'
      currentStep={1}
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
