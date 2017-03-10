/*
 *
 * Home
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import _ from 'lodash';
import { createStructuredSelector } from 'reselect';
import Header from 'components/Header';
import LogoIcon from 'components/LogoIcon';
import YourStreams from 'components/YourStreams';
import ShareWithFriends from 'components/ShareWithFriends';
import StreamList from 'components/StreamList';
import Slogan from 'components/Slogan';
import Footer from 'components/Footer';
import GoogleLogin from 'react-google-login';

import {
   googleConnect, googleConnectLoadingError, userHistory,
} from '../App/actions';

import {
   makeSelectUserHistory,
} from '../App/selectors';

import makeSelectHome from './selectors';
import { changeTerm } from './actions';

function selectTopics(termId, topics) {
  if (termId > 0) {
    return _.find(topics, { term_id: Number(termId) });
  }
  return {};
}

function selectUrls(ids, urls) {
  if (ids && ids.length > 0) {
    return _.filter(urls, (item) => ids.indexOf(item.id) !== -1);
  }
  return [];
}

const friends = [{ name: 'Dung', userId: 2 }, { name: 'Dominic', userId: 5 }, { name: 'Winston', userId: 1 }];

export class Home extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    this.props.dispatch(userHistory());
  }

  render() {
    const { topics, urls } = this.props.history.toJS();
    const { currentTermId } = this.props.home;
    const currentTopic = selectTopics(currentTermId, topics);
    const currentUrls = selectUrls(currentTopic.url_ids, urls);
    return (
      <div style={{ width: '100%', margin: '0 auto' }}>
        <Helmet
          title="Homepage"
          meta={[
            { name: 'description', content: 'Maomao extension' },
          ]}
        />
        <div style={{ zIndex: 100, backgroundColor: '#fff' }}>
          <Header>
            <LogoIcon />
            <Slogan />
            <div style={{ position: 'absolute', top: '50px', right: '40px' }}>
              <ShareWithFriends friends={friends} />
              <GoogleLogin
                clientId="323116239222-b2n8iffvc5ljb71eoahs1k72ee8ulbd7.apps.googleusercontent.com"
                buttonText="Connect with Google"
                onSuccess={this.props.onGoogleSuccess}
                onFailure={this.props.onGoogleFailure}
              />
            </div>
          </Header>
          <YourStreams activeTermId={currentTermId} topics={topics} change={this.props.changeTerm} />
          <StreamList topic={currentTopic} urls={currentUrls} />
        </div>
        <div style={{ clear: 'both' }} />
        <Footer />
      </div>
    );
  }
}

Home.propTypes = {
  history: PropTypes.object,
  home: PropTypes.object,
  changeTerm: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
  onGoogleSuccess: PropTypes.func.isRequired,
  onGoogleFailure: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
  history: makeSelectUserHistory(),
});

function mapDispatchToProps(dispatch) {
  return {
    onGoogleSuccess: (response) => {
      dispatch(googleConnect(response));
    },
    onGoogleFailure: (error) => {
      dispatch(googleConnectLoadingError(error));
    },
    changeTerm: (termId) => {
      dispatch(changeTerm(termId));
    },
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
