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
import { makeSelectLoading, makeSelectGoogle } from '../App/selectors';
import { googleSearch } from '../App/actions';
import { changeKeyword } from './actions';

const DataContainer = Block(InfiniteScroll);

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
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
        <DataContainer
          items={this.props.renderItems(this.props.google)}
          loadMore={this.props.loadMore}
          showLoader={false}
        />
        <Loading isLoading={this.props.loading} />
      </div>
    );
  }
}

HomePage.propTypes = {
  renderItems: PropTypes.func,
  loadMore: PropTypes.func,
  doSearch: PropTypes.func,
  onChange: PropTypes.func,
  google: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
    loadMore: () => {
      // dispatch(googleSearch());
    },
    renderItems: (google) => {
      const { itemListElement } = google;
      const items = [];
      if (itemListElement) {
        let counter = 0;
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
      return items;
    },
    onChange: (e) => {
      dispatch(changeKeyword(e.target.value));
    },
    doSearch: (e) => {
      if (e !== undefined && e.preventDefault) {
        e.preventDefault();
      }
      dispatch(googleSearch());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  keyword: makeSelectKeyword(),
  loading: makeSelectLoading(),
  google: makeSelectGoogle(),
});


export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
