import React, { Component, PropTypes } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import moment from 'moment';

const style = {
  margin: 0,
  top: 'auto',
  right: 20,
  bottom: 20,
  left: 'auto',
  position: 'fixed',
};

const propTypes = {
  score: PropTypes.object,
};

const defaultProps = {
  score: {
    im_score: 0,
    audible_pings: 0,
    time_on_tabs: 0,
    url: '',
    isOpen: false,
  },
};


class Score extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
    this.handleExpandChange = this.handleExpandChange.bind(this);
  }

  handleExpandChange(expanded) {
    this.setState({ expanded });
  }

  render() {
    console.log('im_score', this.props.score);
    const score = this.props.score;
    const url = this.props.score.url;
    let lastSave = `${score.im_score} - Last saved ${moment(Date.now()).fromNow()}`;
    if (score.histories && score.histories.length) {
      for (let counter = score.histories.length; counter > 0; --counter) {
        if (score.histories[counter] && score.histories[counter].url === url && score.histories[counter].result) {
          const history = score.histories[counter].history;
          console.log('found history', history);
          lastSave = `${score.im_score} - Last saved ${moment(history.saveAt).fromNow()}`;
          break;
        }
      }
    }

    return (
      <Card style={style} expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
        <CardHeader
          title="IM SCORE"
          subtitle={lastSave}
          actAsExpander
          showExpandableButton
          />
        <CardText expandable>
          Time on tab: {moment.duration(this.props.score.time_on_tabs).humanize()}
        </CardText>
        <CardText expandable>
          Ping audible: {this.props.score.audible_pings}
        </CardText>
      </Card>
    );
  }
}

Score.propTypes = propTypes;
Score.defaultProps = defaultProps;

export default Score;
