import React, { Component, PropTypes } from 'react';
import ToggleDisplay from 'react-toggle-display';
import RaisedButton from 'material-ui/RaisedButton';
import Radium from 'radium';
import Paper from 'material-ui/Paper';

const customStyles = {
  title: {
    display: 'block',
    fontSize: '20px',
    margin: '20px 0px',
    color: '#000',
  },
  welcome: {
    display: 'block',
    fontSize: '14px',
    margin: '15px 0px',
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
            <div className="maomao-logo" />
            <h2 style={customStyles.title}>Join MaoMao with Google login!</h2>
            <ToggleDisplay hide={this.props.auth.isLogin}>
              <RaisedButton onTouchTap={this.props.onLogin} label="Login" />
              <RaisedButton onTouchTap={this.onClose} label="Close" />
            </ToggleDisplay>
            <ToggleDisplay show={this.props.auth.isLogin}>
              <p style={customStyles.welcome}>Welcome back {this.props.auth.info.name}({this.props.auth.info.email})</p>
              <RaisedButton onTouchTap={this.props.openInvite} label="Share a topic" />
              <RaisedButton onTouchTap={this.props.onLogout} label="Logout" />
              <RaisedButton onTouchTap={this.onClose} label="Close" />
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
