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
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import Block from 'components/Block';
import SearchBar from 'components/SearchBar';
import FacebookGraph from 'components/FacebookGraph';
import GraphKnowledge from 'components/GraphKnowledge';
import Imgur from 'components/Imgur';
import Instagram from 'components/Instagram';
import Reddit from 'components/Reddit';
import YoutubeVideo from 'components/YoutubeVideo';

import messages from './messages';
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
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        <SearchBar loading={this.props.loading} onChange={this.props.onChange} onSearch={this.props.doSearch} />
        <Block>
          <FacebookGraph />
          <GraphKnowledge name="Test" description="Hello" />
          <Imgur />
          <Instagram />
          <YoutubeVideo />
          <Reddit />
        </Block>
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
    doSearch: () => {
      dispatch(googleSearch());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  keyword: makeSelectKeyword(),
  loading: makeSelectLoading(),
});


export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
