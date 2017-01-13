// import React, { Component, PropTypes } from 'react';
import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { pure } from 'recompose';
import moment from 'moment';

const style = {
  margin: 0,
  top: 'auto',
  right: 20,
  bottom: 20,
  left: 'auto',
  zIndex: 1000,
  position: 'fixed',
};

function lastSave(score) {
  const url = score.url;
  let message = `${score.im_score}`;
  if (score.histories.length) {
    const hasSuccessRecord = Array.prototype.find.call(score.histories,
      item => String(item.url) === String(url) && item.history && item.history.result);
    if (hasSuccessRecord) {
      console.log('hasSuccessRecord', hasSuccessRecord);
      message = `${score.im_score} - Last saved ${moment(hasSuccessRecord.saveAt).fromNow()}`;
    }
  }
  return message;
}

const Score = pure(({ score }) =>
  <Card style={style}>
    <CardHeader
      title="IM SCORE"
      subtitle={lastSave(score)}
      actAsExpander
      showExpandableButton
      />
    <CardText expandable>
      Time on tab: {moment.duration(score.time_on_tab).humanize()}
    </CardText>
    <CardText expandable>
      Ping audible: {score.audible_pings}
    </CardText>
  </Card>,
);
export default Score;
