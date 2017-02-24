/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import _ from 'lodash';
import InfiniteScroll from 'redux-infinite-scroll';

import Block from 'components/Block';
import Loading from 'components/Loading';
import Header from 'components/Header';
import SearchBar from 'components/SearchBar';
import GraphKnowledge from 'components/GraphKnowledge';
import LogoIcon from 'components/LogoIcon';
import FacebookGraph from 'components/FacebookGraph';
import Imgur from 'components/Imgur';
import Instagram from 'components/Instagram';
import Reddit from 'components/Reddit';
import YoutubeVideo from 'components/YoutubeVideo';

import { makeSelectKeyword } from './selectors';
import { makeSelectLoading, makeSelectGoogle, makeSelectYoutube } from '../App/selectors';
import { googleSearch, youtubeSearch, cleanSearchResult } from '../App/actions';
import { changeKeyword, resetPage, nextPage } from './actions';

const DataContainer = Block(InfiniteScroll);

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { itemListElement } = this.props.google;
    const items = [];
    let counter = 0;
    if (itemListElement) {
      _.forEach(itemListElement, (item) => {
        items.push(
          <div className="grid-item" key={counter += 1}>
            <GraphKnowledge
              name={item.result.name}
              description={item.result.detailedDescription && item.result.detailedDescription.articleBody}
              image={item.result.image && item.result.image.contentUrl}
              url={item.result.detailedDescription && item.result.detailedDescription.url}
            />
          </div>);
        items.push(<div className="grid-item" key={counter += 1}><FacebookGraph /></div>);
        items.push(<div className="grid-item" key={counter += 1}><Imgur /></div>);
        items.push(<div className="grid-item" key={counter += 1}><Instagram /></div>);
        items.push(<div className="grid-item" key={counter += 1}><Reddit /></div>);
        items.push(<div className="grid-item" key={counter += 1}><YoutubeVideo /></div>);
      });
    }
    return (
      <div>
        <Helmet
          title="Home Page"
          meta={[
            { name: 'description', content: 'MaoMao homepage' },
          ]}
        />
        <Header>
          <LogoIcon />
          <SearchBar onChange={this.props.onChange} onSearch={this.props.doSearch} />
        </Header>
        {
        items.length > 0 &&
          <DataContainer
            items={items}
            loadMore={this.props.loadMore}
            loadingMore={this.props.loading}
            showLoader={false}
            elementIsScrollable={false}
            threshold={150}
          />
        }
        <Loading isLoading={this.props.loading} />
      </div>
    );
  }
}

HomePage.propTypes = {
  loadMore: PropTypes.func,
  doSearch: PropTypes.func,
  onChange: PropTypes.func,
  google: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
    loadMore: () => {
      dispatch(nextPage());
      dispatch(googleSearch());
      dispatch(youtubeSearch());
    },
    onChange: (e) => {
      dispatch(changeKeyword(e.target.value));
    },
    doSearch: (e) => {
      if (e !== undefined && e.preventDefault) {
        e.preventDefault();
      }
      dispatch(resetPage());
      dispatch(googleSearch());
      dispatch(youtubeSearch());
      dispatch(cleanSearchResult());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  keyword: makeSelectKeyword(),
  loading: makeSelectLoading(),
  google: makeSelectGoogle(),
  youtube: makeSelectYoutube(),
});


export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
