import React, { PropTypes } from 'react';
import ToggleDisplay from 'react-toggle-display';
import RaisedButton from 'material-ui/RaisedButton';
import { onlyUpdateForKeys, lifecycle, compose } from 'recompose';
import $ from 'jquery';
import Radium from 'radium';
import { Card, CardActions, CardHeader } from 'material-ui/Card';

const customStyles = {
  title: {
    display: 'block',
    fontSize: '20px',
    color: '#000',
  },
  animateText: {
    color: '#999',
    fontFamily: 'Rokkitt',
    fontSize: '75px',
    lineHeight: '68px',
    textShadow: '0.025em 0.025em 0.025em rgba(0, 0, 0, 0.8)',
  },
  card: {
    backgroundColor: 'none',
    boxShadow: 'none',
  },
  cardHeader: {
    padding: '4px 5px',
    margin: '15px auto 0',
    border: '1px solid #fcfcfc',
    borderRadius: '50px',
    display: 'inline-block',
    verticalAlign: 'middle',
    boxShadow: '0 1px 7px rgba(0, 0, 0, .175)',
  },
  cardAction: {
    padding: 'none',
  },
  cardTitle: {
    padding: '0',
    marginTop: '10px',
    fontSize: '20px',
    color: '#000',
  },
  overlay: {
    zIndex: 9999,
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
    animation: 'vex-fadein 0.5s',
  },
  content: {
    position: 'absolute',
    width: '400px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginLeft: '-200px',
    marginTop: '-250px',
    backgroundColor: '#fff',
    border: '1px solid rgb(204, 204, 204)',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '7px',
    outline: 'none',
    padding: '20px',
    textAlign: 'center',
    animation: 'vex-flyin 0.5s',
  },
  button: {
    minWidth: '280px',
    marginTop: '15px',
  },
};

const propTypes = {
  auth: PropTypes.object,
  onGoogleLogin: PropTypes.func.isRequired,
  onFacebookLogin: PropTypes.func.isRequired,
  onLinkedFacebook: PropTypes.func.isRequired,
  onLinkedGoogle: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const defaultProps = {
  auth: {
    isLogin: false,
    googleToken: '',
    facebookToken: '',
    info: {},
  },
  isShareOpen: false,
  isOpen: false,
};

function WelcomeModal({
   auth, isOpen,
   onGoogleLogin, onFacebookLogin, onLinkedFacebook, onLinkedGoogle,
   onClose, onLogout }) {
  const networks = auth.accounts.map(item => item.providerId);
  return (
    <ToggleDisplay if={isOpen}>
      <div style={customStyles.overlay}>
        <div style={customStyles.content}>
          <button onClick={onClose} className="close_button" />
          <div className="maomao-logo" />
          <h1 className="tlt glow in" style={customStyles.animateText}>
            maomao
           </h1>
          <ToggleDisplay if={!auth.isLogin}>
            <h2 style={customStyles.cardTitle}>Join MaoMao!</h2>
            <RaisedButton
              onTouchTap={onGoogleLogin}
              label="Google Connect"
              secondary
              style={customStyles.button}
            />
            <br />
            <RaisedButton
              onTouchTap={onFacebookLogin}
              label="Facebook Connect"
              primary
              style={customStyles.button}
            />
          </ToggleDisplay>
          <ToggleDisplay if={auth.isLogin}>
            <Card style={customStyles.card}>
              <CardHeader
                className="card-header"
                style={customStyles.cardHeader}
                title={auth.info.name}
                subtitle={auth.info.email}
                avatar={auth.info.picture}
              />
              <CardActions style={customStyles.cardAction}>
                { auth &&
                  !networks.includes('facebook.com') &&
                  <RaisedButton
                    onTouchTap={onLinkedFacebook}
                    label="Facebook Connect"
                    primary
                    style={customStyles.button}
                  />}
                { auth &&
                  !networks.includes('google.com') &&
                  <RaisedButton
                    onTouchTap={onLinkedGoogle}
                    label="Google Connect"
                    secondary
                    style={customStyles.button}
                  />}
                <br />
                <RaisedButton
                  onTouchTap={onLogout}
                  label="Logout"
                  style={customStyles.button}
                />
              </CardActions>
            </Card>
          </ToggleDisplay>
        </div>
      </div>
    </ToggleDisplay>
  );
}

WelcomeModal.propTypes = propTypes;
WelcomeModal.defaultProps = defaultProps;

const enhance = compose(
  lifecycle({
    componentDidMount() {
      $('.tlt').fitText(0.5).textillate();
    },
    componentDidUpdate() {
      $('.tlt').fitText(0.5).textillate();
    },
  }),
  onlyUpdateForKeys(['auth', 'isOpen']),
);

export default Radium(enhance(WelcomeModal));
