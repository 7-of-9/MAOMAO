import React from 'react'
import PropTypes from 'prop-types'
import { StickyContainer, Sticky } from 'react-sticky'
import NoSSR from 'react-no-ssr'
import InfiniteScroll from 'react-infinite-scroller'
// import Block from '../../components/Block'
import Loading from '../../components/Loading'
import Header from '../../components/Header'
import SearchBar from '../../components/SearchBar'
import LogoIcon from '../../components/LogoIcon'

const SRRLoading = () => (<div className='container-fluid'>Loading...</div>)
export class Discovery extends React.Component {
  render () {
    let elements = []
    return (
      <StickyContainer>
        <Sticky style={{ zIndex: 100, backgroundColor: '#fff' }}>
          <Header>
            <LogoIcon />
            <SearchBar />
          </Header>
        </Sticky>
        {
        elements.length > 0 &&
        <NoSSR onSSR={<SRRLoading />}>
          <InfiniteScroll
            loadMore={this.props.loadMore}
            hasMore={this.props.loading}
            threshold={200}
          >
            {elements}
          </InfiniteScroll>
        </NoSSR>
        }
        <Loading isLoading={this.props.loading} />
      </StickyContainer>
    )
  }
}

Discovery.propTypes = {
  location: PropTypes.object,
  terms: PropTypes.any,
  loadMore: PropTypes.func,
  onChange: PropTypes.func,
  doSearch: PropTypes.func,
  loading: PropTypes.bool.isRequired
}

export default Discovery
