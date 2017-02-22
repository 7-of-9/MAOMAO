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

import Block from 'components/Block';
import Loading from 'components/Loading';
import Header from 'components/Header';
import SearchBar from 'components/SearchBar';
import FacebookGraph from 'components/FacebookGraph';
import GraphKnowledge from 'components/GraphKnowledge';
import Imgur from 'components/Imgur';
import LogoIcon from 'components/LogoIcon';
import Instagram from 'components/Instagram';
import Reddit from 'components/Reddit';
import YoutubeVideo from 'components/YoutubeVideo';

import { makeSelectKeyword } from './selectors';
import { makeSelectLoading } from '../App/selectors';
import { googleSearch } from '../App/actions';
import { changeKeyword } from './actions';

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
        <Block>
          <FacebookGraph />
          <GraphKnowledge name="Test" description="Hello" />
          <Imgur />
          <Instagram />
          <YoutubeVideo />
          <Reddit />
        </Block>
        <div style={{ textAlign: 'center', margin: '0 auto', display: this.props.loading ? '' : 'none' }}>
          <Loading isLoading={this.props.loading} />
        </div>
      </div>
    );
  }
}

HomePage.propTypes = {
  doSearch: PropTypes.func,
  onChange: PropTypes.func,
  loading: PropTypes.bool.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
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
});


export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
