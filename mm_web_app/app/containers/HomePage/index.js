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

import Block from 'components/Block';
import Loading from 'components/Loading';
import Header from 'components/Header';
import SearchBar from 'components/SearchBar';
import LogoIcon from 'components/LogoIcon';
import BlockElement from 'components/BlockElement';
// import FacebookGraph from 'components/FacebookGraph';
// import Imgur from 'components/Imgur';
// import Instagram from 'components/Instagram';
// import Reddit from 'components/Reddit';

import { makeSelectKeyword } from './selectors';
import {
  makeSelectLoading, makeSelectGoogle, makeSelectGoogleNews, makeSelectGoogleKnowledge, makeSelectYoutube,
} from '../App/selectors';
import {
   googleKnowledgeSearch, googleSearch, googleNewsSearch, youtubeSearch, cleanSearchResult,
} from '../App/actions';
import { changeKeyword, resetPage, nextPage } from './actions';

const DataContainer = Block(InfiniteScroll);

/**
 * Mash up all result from API
 * @param  {[type]} props [description]
 * @return {[type]}      [description]
 */
function mashUp(props) {
  // Parse data
  const graphKnowledges = [];
  const search = [];
  const news = [];
  const videos = [];
  const { googleKnowledges } = props.googleKnowledge.toJS();
  const { youtubeVideos } = props.youtube.toJS();
  const { googleNews } = props.googleNews.toJS();
  const { googleSearchResult } = props.google.toJS();
  let counter = 0;
  if (googleKnowledges.length || youtubeVideos.length || googleNews.length || googleSearchResult.length) {
    _.forEach(googleKnowledges, (item) => {
      const moreDetailUrl = (item.result.detailedDescription && item.result.detailedDescription.url) || item.result.url;
      if (moreDetailUrl && item.result.image && item.result.image.contentUrl) {
        graphKnowledges.push(
          <div className="grid-item" key={counter += 1}>
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
      if (item.img) {
        news.push(
          <div className="grid-item" key={counter += 1}>
            <BlockElement
              title={item.title}
              description={item.description}
              url={item.url}
              image={item.img}
              type={'Google News'}
            />
          </div>);
      }
    });
    _.forEach(googleSearchResult, (item) => {
      if (item.img) {
        search.push(
          <div className="grid-item" key={counter += 1}>
            <BlockElement
              title={item.title}
              description={item.description}
              url={item.url}
              image={item.img}
              type={'Google Search'}
            />
          </div>);
      }
    });
    _.forEach(youtubeVideos, (item) => {
      if (item.snippet.thumbnails && item.snippet.thumbnails.medium.url) {
        videos.push(
          <div className="grid-item" key={counter += 1}>
            <BlockElement
              name={item.snippet.title}
              description={item.snippet.description}
              image={item.snippet.thumbnails && item.snippet.thumbnails.medium.url}
              url={`https://www.youtube.com/watch?v=${item.id.videoId}`}
              type={'Youtube'}
            />
          </div>);
      }
    });
  }

  // Mashup records
  const result = [graphKnowledges, news, search, videos];
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
      </div>
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
      dispatch(googleKnowledgeSearch());
      dispatch(googleSearch());
      dispatch(googleNewsSearch());
      dispatch(youtubeSearch());
      dispatch(cleanSearchResult());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  keyword: makeSelectKeyword(),
  loading: makeSelectLoading(),
  google: makeSelectGoogle(),
  googleNews: makeSelectGoogleNews(),
  googleKnowledge: makeSelectGoogleKnowledge(),
  youtube: makeSelectYoutube(),
});

const OptimizedComponent = pure(HomePage);
const HyperOptimizedComponent = onlyUpdateForKeys([
  'loading', 'google', 'googleKnowledge', 'googleNews', 'youtube',
])(OptimizedComponent);

export default connect(mapStateToProps, mapDispatchToProps)(HyperOptimizedComponent);
