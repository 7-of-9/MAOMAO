import React, { PropTypes } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { pure, onlyUpdateForKeys, compose } from 'recompose';
import moment from 'moment';

const style = {
  card: {
    top: '50px',
    right: '10px',
    zIndex: 1000,
    position: 'fixed',
    color: '#FFF',
    borderRadius: '6px',
    background: 'rgba(242,242,242,0.63)',
    boxShadow: 'rgba(0, 0, 0, 0.14902) 3px 3px 11px 3px',
  },
  header: {
    padding: '8px',
  },
  text: {
    padding: '8px',
  },
};

const propTypes = {
  score: PropTypes.object,
};

const defaultProps = {
  score: {
    url: '',
    histories: [],
    time_on_tab: 0,
    audible_pings: 0,
    im_score: 0,
  },
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
function Score({ score: { url, histories, im_score, time_on_tab, audible_pings } }) {
  return (
    <Card className="blur" style={style.card}>
      <CardHeader
        style={style.header}
        title={im_score}
        actAsExpander
        showExpandableButton
      />
      <CardText style={style.text} expandable>
      Time on tab: {moment.duration(time_on_tab).humanize()}<br />
      Ping audible: {audible_pings}<br />
        {lastSave(url, histories)}
      </CardText>
    </Card>);
}

Score.propTypes = propTypes;
Score.defaultProps = defaultProps;

const enhance = compose(
  pure,
  onlyUpdateForKeys(['score']),
);

export default enhance(Score);
