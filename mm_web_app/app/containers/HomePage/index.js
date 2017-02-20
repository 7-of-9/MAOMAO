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

import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

import Block from 'components/Block';
import SearchBar from 'components/SearchBar';
import FacebookGraph from 'components/FacebookGraph';
import GraphKnowledge from 'components/GraphKnowledge';
import Imgur from 'components/Imgur';
import Instagram from 'components/Instagram';
import YoutubeVideo from 'components/YoutubeVideo';

import messages from './messages';

class HomePage extends Component {

  constructor(props) {
    super(props);
    this.doSearch = this.doSearch.bind(this);
  }

  doSearch() {
    console.warn('doSearch');
  }

  render() {
    return (
      <div>
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        <SearchBar onClick={this.doSearch} />
        <Block>
          <FacebookGraph />
          <GraphKnowledge />
          <Imgur />
          <Instagram />
          <YoutubeVideo />
        </Block>
      </div>
    );
  }
}

export default HomePage;
