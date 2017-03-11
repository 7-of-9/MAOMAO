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
import AppHeader from 'containers/AppHeader';
import YourStreams from 'components/YourStreams';
import StreamList from 'components/StreamList';
import Footer from 'components/Footer';

// import { userHistory } from '../App/actions';
import { makeSelectUserHistory } from '../App/selectors';

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
        <div style={{ zIndex: 100 }}>
          <AppHeader friends={friends} />
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
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome(),
  history: makeSelectUserHistory(),
});

function mapDispatchToProps(dispatch) {
  return {
    changeTerm: (termId) => {
      dispatch(changeTerm(termId));
    },
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
