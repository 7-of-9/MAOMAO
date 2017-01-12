// import React, { Component, PropTypes } from 'react';
import React from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { compose, withState, withProps, withHandlers } from 'recompose';
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

const enhance = compose(
  withState('expanded', 'handleExpandChange', false),
  withProps('score', 'score'),
  withHandlers({
    onChange: props => () => props.handleExpandChange(isExpand => !isExpand),
  }),
);

function lastSave(score) {
  const url = score.url;
  let message = `${score.im_score}`;
  if (score.histories && score.histories.length) {
    for (let counter = score.histories.length; counter > 0; --counter) {
      if (score.histories[counter] && String(score.histories[counter].url) === String(url) && score.histories[counter].history && score.histories[counter].history.result) {
        const history = score.histories[counter].history;
        console.log('found history', history);
        message = `${score.im_score} - Last saved ${moment(history.saveAt).fromNow()}`;
        break;
      }
    }
  }
  return message;
}

const Score = enhance(({ expanded, score, onChange }) =>
  <Card style={style} expanded={expanded} onExpandChange={onChange}>
    <CardHeader
      title="IM SCORE"
      subtitle={lastSave(score)}
      actAsExpander
      showExpandableButton
      />
    <CardText expandable>
      Time on tab: {moment.duration(score.time_on_tabs).humanize()}
    </CardText>
    <CardText expandable>
      Ping audible: {score.audible_pings}
    </CardText>
  </Card>,
);
export default Score;
