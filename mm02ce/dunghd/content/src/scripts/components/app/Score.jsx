// import React, { Component, PropTypes } from 'react';
import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { pure } from 'recompose';
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

function lastSave(score) {
  const url = score.url;
  let message = '';
  if (score.histories.length) {
    const hasSuccessRecord = Array.prototype.find.call(score.histories,
      item => String(item.url) === String(url) && item.history && item.history.result);
    if (hasSuccessRecord) {
      message = `Last saved ${moment(hasSuccessRecord.saveAt).fromNow()}`;
    }
  }
  return message;
}

const Score = pure(({ score }) =>
  <Card className="blur" style={style.card}>
    <CardHeader
      style={style.header}
      title={score.im_score}
      actAsExpander
      showExpandableButton
    />
    <CardText style={style.text} expandable>
      Time on tab: {moment.duration(score.time_on_tab).humanize()}<br />
      Ping audible: {score.audible_pings}<br />
      {lastSave(score)}
    </CardText>
  </Card>,
);
export default Score;
