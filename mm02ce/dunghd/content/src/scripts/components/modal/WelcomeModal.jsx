import React, { Component, PropTypes } from 'react';
import ToggleDisplay from 'react-toggle-display';
import RaisedButton from 'material-ui/RaisedButton';
import $ from 'jquery';
import Radium from 'radium';
import Paper from 'material-ui/Paper';
import { Card, CardActions, CardHeader, CardTitle } from 'material-ui/Card';

const customStyles = {
  title: {
    display: 'block',
    fontSize: '20px',
    margin: '20px 0px',
    color: '#000',
  },
  animateText: {
    color: '#fff',
    fontFamily: 'Rokkitt',
    fontSize: '75px',
    textShadow: '0.025em 0.025em 0.025em rgba(0, 0, 0, 0.8)',
  },
  card: {
    backgroundColor: 'none',
    boxShadow: 'none',
  },
  cardAction: {
    padding: 'none',
  },
  overlay: {
    zIndex: 9999,
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  content: {
    position: 'absolute',
    width: '400px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '1px solid rgb(204, 204, 204)',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '4px',
    outline: 'none',
    padding: '20px',
    textAlign: 'center',
  },
};

const propTypes = {
  auth: PropTypes.object,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  openInvite: PropTypes.func.isRequired,
  isShareOpen: PropTypes.bool.isRequired,
};

const defaultProps = {
  auth: {
    isLogin: false,
    accessToken: '',
    info: {},
  },
  isShareOpen: false,
};

class WelcomeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: false,
    };
    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    $('.tlt').textillate();
  }

  componentDidUpdate() {
    $('.tlt').textillate();
  }

  onClose() {
    this.setState({
      hidden: true,
    });
  }

  render() {
    return (
      <ToggleDisplay hide={this.props.isShareOpen || this.state.hidden}>
        <div style={customStyles.overlay}>
          <Paper style={customStyles.content} zDepth={3}>
            <h1 className="tlt glow" style={customStyles.animateText}>
              maomao
             </h1>
            <ToggleDisplay hide={this.props.auth.isLogin}>
              <h2 style={customStyles.title}>Join MaoMao with Google login!</h2>
              <RaisedButton onTouchTap={this.props.onLogin} label="Login" />
              <RaisedButton onTouchTap={this.onClose} label="Close" />
            </ToggleDisplay>
            <ToggleDisplay show={this.props.auth.isLogin}>
              <Card style={customStyles.card}>
                <CardHeader
                  style={customStyles.cardAction}
                  title={this.props.auth.info.name}
                  subtitle={this.props.auth.info.email}
                  avatar={this.props.auth.info.picture}
                  />
                <CardTitle title="Welcome back!" />
                <CardActions style={customStyles.cardAction}>
                  <RaisedButton onTouchTap={this.props.openInvite} label="Share a topic" />
                  <RaisedButton onTouchTap={this.props.onLogout} label="Logout" />
                  <RaisedButton onTouchTap={this.onClose} label="Close" />
                </CardActions>
              </Card>
            </ToggleDisplay>
          </Paper>
        </div>
      </ToggleDisplay>
    );
  }
}

WelcomeModal.propTypes = propTypes;
WelcomeModal.defaultProps = defaultProps;
WelcomeModal = Radium(WelcomeModal);

export default WelcomeModal;
