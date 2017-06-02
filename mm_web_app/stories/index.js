import React from 'react'
import { storiesOf, action } from '@storybook/react'
import BlockElement from '../components/BlockElement'
import DiscoveryButton from '../components/DiscoveryButton'
import { GoogleShare, Toolbar, ShareOptions } from '../components/Share'
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

storiesOf('Share', module)
  .add('GoogleShare - empty contacts', () => (
    <GoogleShare contacts={[]} mostRecentUses={[]} handleChange={action('handleChange')} />
  ))
  .add('Toolbar - active google share', () => (
    <Toolbar active='Google' onChange={action('onChange')} onShare={action('onShare')} onSendMsg={action('onSendMsg')} />
  ))
  .add('ShareOptions - empty topics', () => (
    <ShareOptions active='all' topics={[]} onChange={action('onChange')} />
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
