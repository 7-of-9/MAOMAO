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
import ReactPlayer from 'react-player';
import { pure, onlyUpdateForKeys } from 'recompose';
import { List } from 'immutable';
import { StickyContainer, Sticky } from 'react-sticky';

import Block from 'components/Block';
import Loading from 'components/Loading';
import Header from 'components/Header';
import SearchBar from 'components/SearchBar';
import LogoIcon from 'components/LogoIcon';
import BlockElement from 'components/BlockElement';
import { makeSelectTerms } from './selectors';
import {
  makeSelectLoading, makeSelectGoogle, makeSelectGoogleNews, makeSelectGoogleKnowledge, makeSelectYoutube, makeSelectReddit,
} from '../App/selectors';
import {
   googleKnowledgeSearch, googleSearch, googleNewsSearch, youtubeSearch, redditSearch, cleanSearchResult,
} from '../App/actions';
import { changeTerms, resetPage, nextPage } from './actions';

const DataContainer = Block(InfiniteScroll);
/**
 * Mash up all result from API
 * @param  {[type]} props [description]
 * @return {[type]}      [description]
 */
function mashUp(props) {
  // Parse data
  let urls = List([]);
  const graphKnowledges = [];
  const search = [];
  const news = [];
  const videos = [];
  const reddits = [];
  const { googleKnowledges } = props.googleKnowledge.toJS();
  const { youtubeVideos } = props.youtube.toJS();
  const { googleNews } = props.googleNews.toJS();
  const { googleSearchResult } = props.google.toJS();
  const { redditListing } = props.reddit.toJS();
  if (googleKnowledges.length || youtubeVideos.length || googleNews.length || googleSearchResult.length || redditListing.length) {
    _.forEach(googleKnowledges, (item) => {
      const moreDetailUrl = (item.result.detailedDescription && item.result.detailedDescription.url) || item.result.url;
      if (!urls.includes(moreDetailUrl) && moreDetailUrl && item.result.image && item.result.image.contentUrl) {
        urls = urls.insert(urls.size, moreDetailUrl);
        graphKnowledges.push(
          <div className="grid-item" key={`GK-${moreDetailUrl}`}>
            <BlockElement
              name={item.result.name}
              description={(item.result.detailedDescription && item.result.detailedDescription.articleBody) || item.result.description}
              image={item.result.image && item.result.image.contentUrl}
              url={moreDetailUrl}
              type={'Google Knowledge'}
            />
          </div>);
      }
    });
    _.forEach(googleNews, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls = urls.insert(urls.size, item.url);
        news.push(
          <div className="grid-item" key={`GN-${item.url}`}>
            <BlockElement
              name={item.title}
              description={item.description}
              url={item.url}
              image={item.img}
              type={'Google News'}
            />
          </div>);
      }
    });
    _.forEach(googleSearchResult, (item) => {
      if (item.img && item.url && !urls.includes(item.url)) {
        urls = urls.insert(urls.size, item.url);
        search.push(
          <div className="grid-item" key={`GS-${item.url}`}>
            <BlockElement
              name={item.title}
              description={item.description}
              url={item.url}
              image={item.img}
              type={'Google Search'}
            />
          </div>);
      }
    });
    _.forEach(youtubeVideos, (item) => {
      const youtubeUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
      if (item.snippet.thumbnails && item.snippet.thumbnails.medium.url && !urls.includes(youtubeUrl)) {
        urls = urls.insert(urls.size, youtubeUrl);
        videos.push(
          <div className="grid-item" key={`YT-${youtubeUrl}`}>
            <BlockElement
              name={item.snippet.title}
              description={item.snippet.description}
              image={item.snippet.thumbnails && item.snippet.thumbnails.medium.url}
              url={youtubeUrl}
              type={'Youtube'}
            />
          </div>);
      }
    });
    _.forEach(redditListing, (item) => {
      if (item.preview && item.preview.images && item.preview.images[0] && item.url && !urls.includes(item.url)) {
        urls = urls.insert(urls.size, item.url);
        reddits.push(
          <div className="grid-item" key={`RD-${item.url}`}>
            <BlockElement
              name={item.title}
              description={item.selftext || item.title}
              image={item.preview.images[0].resolutions[item.preview.images[0].resolutions.length - 1].url}
              url={item.url}
              type={'Reddit'}
            />
          </div>);
      }
    });
  }
  // Mashup records
  const result = [graphKnowledges, news, search, reddits, videos];
  const elements = [];
  const numberItems = _.map(result, (item) => item.length);
  const maxItems = _.max(numberItems);
  for (let index = 0; index < maxItems; index += 1) {
    for (let count = 0; count < result.length; count += 1) {
      if (result[count] && result[count][index]) {
        elements.push(result[count][index]);
      }
    }
  }
  return elements;
}


export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    let elements = [];
    // Mash up the result
    elements = mashUp(this.props);
    return (
      <StickyContainer>
        <Helmet
          title="Home Page"
          meta={[
            { name: 'description', content: 'MaoMao homepage' },
          ]}
        />
        <Sticky style={{ zIndex: 100, backgroundColor: '#fff' }}>
          <Header>
            <LogoIcon />
            <SearchBar onChange={this.props.onChange} onSearch={this.props.doSearch} />
          </Header>
        </Sticky>
        {
        elements.length > 0 &&
          <DataContainer
            items={elements}
            loadMore={this.props.loadMore}
            loadingMore={this.props.loading}
            showLoader={false}
            elementIsScrollable={false}
            threshold={200}
          />
        }
        <Loading isLoading={this.props.loading} />
        <ReactPlayer playing={false} />
      </StickyContainer>
    );
  }
}

HomePage.propTypes = {
  loadMore: PropTypes.func,
  onChange: PropTypes.func,
  doSearch: PropTypes.func,
  loading: PropTypes.bool.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
    loadMore: () => {
      dispatch(nextPage());
      dispatch(googleKnowledgeSearch());
      dispatch(googleSearch());
      dispatch(googleNewsSearch());
      dispatch(redditSearch());
      dispatch(youtubeSearch());
    },
    onChange: (terms) => {
      dispatch(changeTerms(terms));
    },
    doSearch: (e) => {
      if (e !== undefined && e.preventDefault) {
        e.preventDefault();
      }
      dispatch(resetPage());
      dispatch(googleKnowledgeSearch());
      dispatch(googleSearch());
      dispatch(googleNewsSearch());
      dispatch(youtubeSearch());
      dispatch(redditSearch());
      dispatch(cleanSearchResult());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  terms: makeSelectTerms(),
  loading: makeSelectLoading(),
  google: makeSelectGoogle(),
  googleNews: makeSelectGoogleNews(),
  googleKnowledge: makeSelectGoogleKnowledge(),
  youtube: makeSelectYoutube(),
  reddit: makeSelectReddit(),
});

const OptimizedComponent = pure(HomePage);
const HyperOptimizedComponent = onlyUpdateForKeys([
  'loading', 'google', 'googleKnowledge', 'googleNews', 'youtube', 'reddit',
])(OptimizedComponent);

export default connect(mapStateToProps, mapDispatchToProps)(HyperOptimizedComponent);
