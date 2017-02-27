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
// import GoogleResult from 'components/GoogleResult';
// import GoogleNews from 'components/GoogleNews';
// import FacebookGraph from 'components/FacebookGraph';
// import Imgur from 'components/Imgur';
// import Instagram from 'components/Instagram';
// import Reddit from 'components/Reddit';
import YoutubeVideo from 'components/YoutubeVideo';

import { makeSelectKeyword } from './selectors';
import { makeSelectLoading, makeSelectGoogleKnowledge, makeSelectYoutube } from '../App/selectors';
import { googleKnowledgeSearch, youtubeSearch, cleanSearchResult } from '../App/actions';
import { changeKeyword, resetPage, nextPage } from './actions';

const DataContainer = Block(InfiniteScroll);

/**
 * Mash up all result from API
 * @param  {[type]} args [description]
 * @return {[type]}      [description]
 */
function mashUp(...args) {
  const result = [];
  const numberItems = _.map(args, (item) => item.length);
  const maxItems = _.max(numberItems);
  for (let index = 0; index < maxItems; index += 1) {
    for (let count = 0; count < args.length; count += 1) {
      if (args[count] && args[count][index]) {
        result.push(args[count][index]);
      }
    }
  }
  return result;
}


export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    let elements = [];
    const graphKnowledges = [];
    const videos = [];
    const { itemListElement } = this.props.googleKnowledge;
    const { items } = this.props.youtube;
    let counter = Date.now();
    if (itemListElement || items) {
      _.forEach(itemListElement, (item) => {
        graphKnowledges.push(
          <div className="grid-item" key={counter += 1}>
            <GraphKnowledge
              name={item.result.name}
              description={item.result.detailedDescription && item.result.detailedDescription.articleBody}
              image={item.result.image && item.result.image.contentUrl}
              url={item.result.detailedDescription && item.result.detailedDescription.url}
            />
          </div>);
      });
      _.forEach(items, (item) => {
        videos.push(
          <div className="grid-item" key={counter += 1}>
            <YoutubeVideo
              name={item.snippet.title}
              description={item.snippet.description}
              image={item.snippet.thumbnails && item.snippet.thumbnails.medium.url}
              url={`http://www.youtube.video/wathch?v=${item.id.videoId}`}
            />
          </div>);
      });
    }
    // Mash up the result
    elements = mashUp(graphKnowledges, videos);
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
  onChange: PropTypes.func,
  doSearch: PropTypes.func,
  googleKnowledge: PropTypes.object.isRequired,
  youtube: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
    loadMore: () => {
      dispatch(nextPage());
      dispatch(googleKnowledgeSearch());
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
      dispatch(youtubeSearch());
      dispatch(cleanSearchResult());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  keyword: makeSelectKeyword(),
  loading: makeSelectLoading(),
  googleKnowledge: makeSelectGoogleKnowledge(),
  youtube: makeSelectYoutube(),
});


export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
