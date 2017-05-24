import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { onlyUpdateForKeys, flattenProp, compose } from 'recompose';
import moment from 'moment';
import logger from '../utils/logger';

const style = {
  card: {
    top: '90px',
    right: '25px',
    zIndex: 1000,
    position: 'fixed',
    color: '#FFF',
    borderRadius: '6px',
    background: 'rgba(242,242,242,0.63)',
    boxShadow: 'rgba(0, 0, 0, 0.14902) 3px 3px 11px 3px',
    WebkitOverflowScrolling: 'touch',
    animation: 'vex-flyin 0.5s',
  },
  header: {
    padding: '8px',
  },
  text: {
    padding: '8px',
  },
};

const propTypes = {
  url: PropTypes.string,
  histories: PropTypes.array,
  time_on_tab: PropTypes.number,
  audible_pings: PropTypes.number,
  im_score: PropTypes.number,
};

const defaultProps = {
  url: '',
  histories: [],
  time_on_tab: 0,
  audible_pings: 0,
  im_score: 0,
};

function lastSave(url, histories) {
  let message = '';
  if (histories.length) {
    const hasSuccessRecord = Array.prototype.find.call(histories,
      item => String(item.url) === String(url) && item.history && item.history.result);
    if (hasSuccessRecord) {
      message = `Last saved ${moment(hasSuccessRecord.saveAt).fromNow()}`;
    }
  }
  return message;
}

/* eslint-disable camelcase */
function Score({ url, histories, im_score, time_on_tab, audible_pings }) {
  logger.info('Score url, histories, im_score, time_on_tab, audible_pings', url, histories, im_score, time_on_tab, audible_pings);
  return (
    <Card className="blur" style={style.card}>
      <CardHeader
        className="score-title"
        style={style.header}
        title={im_score}
        actAsExpander
        showExpandableButton
      />
      <CardText className="list-para" style={style.text} expandable>
        <p>Time on tab: <span>{moment.duration(time_on_tab).humanize()}</span></p>
        <p>Ping audible: <span>{audible_pings}</span></p>
        <p>{lastSave(url, histories)}</p>
      </CardText>
    </Card>);
}

Score.propTypes = propTypes;
Score.defaultProps = defaultProps;

const enhance = compose(
  flattenProp('score'),
  onlyUpdateForKeys(['url', 'im_score', 'time_on_tab', 'audible_pings']),
);

export default enhance(Score);
