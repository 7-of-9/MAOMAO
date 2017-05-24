import React from 'react';
import PropTypes from 'prop-types';
import ToggleDisplay from 'react-toggle-display';
import { pure, shallowEqual, flattenProp, shouldUpdate, lifecycle, compose } from 'recompose';
import $ from 'jquery';
import Radium from 'radium';
import { Card, CardActions, CardHeader } from 'material-ui/Card';
import logger from '../utils/logger';

window.jQuery = $;

require('../../vendors/jquery.fittext');
require('../../vendors/jquery.lettering');
require('../../vendors/jquery.textillate');

const customStyles = {
  title: {
    display: 'block',
    fontSize: '20px',
    color: '#000',
  },
  animateText: {
    color: '#999',
    fontFamily: 'rokkittsemibold',
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
    textAlign: 'center',
    padding: '0',
    margin: '10px 0 15px',
    fontSize: '20px',
    color: '#000',
  },
  overlay: {
    zIndex: 999999999,
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
    animation: 'vex-fadein 0.5s',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
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
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 10px 30px, rgba(0, 0, 0, 0.3) 0px 6px 10px',
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
  onFacebookLogin: PropTypes.func.isRequired,
  isLogin: PropTypes.bool.isRequired,
  info: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const defaultProps = {
  isLogin: false,
  info: {},
  isOpen: false,
};

function WelcomeModal({
  isLogin, info, isOpen,
  onFacebookLogin,
  onClose, onLogout }) {
  logger.info('isLogin, info, isOpen', isLogin, info, isOpen);
  return (
    <ToggleDisplay if={isOpen}>
      <div style={customStyles.overlay}>
        <div style={customStyles.content}>
          <a className="close_popup" onClick={onClose}><i className="icons-close" /></a>
          <a href="http://maomao.rocks" target="_blank" rel="noopener noreferrer">
            <div className="maomao-logo" />
          </a>
          <h1 className="welcome-heading">
            <span className="logo-bg" />
          </h1>
          <ToggleDisplay hide={isLogin} className="position-normal">
            <h2 style={customStyles.cardTitle}>Join maomao now!</h2>
            <a className="btn btn-block btn-social btn-facebook" onClick={onFacebookLogin}>
              <span><i className="icons-facebook" /></span> Sign in with Facebook
            </a>
          </ToggleDisplay>
          <ToggleDisplay show={isLogin} className="position-normal">
            <Card style={customStyles.card}>
              <CardHeader
                className="card-header"
                style={customStyles.cardHeader}
                title={info.name}
                subtitle={info.email}
                avatar={info.picture}
              />
              <CardActions style={customStyles.cardAction} className="position-normal">
                <a className="btn btn-block btn-social btn-logout" onClick={onLogout}>
                  <span><i className="icons_signout" /></span> Logout
                  </a>
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
  flattenProp('auth'),
  shouldUpdate((props, nextProps) => shallowEqual(props) !== shallowEqual(nextProps)),
  pure,
);

export default Radium(enhance(WelcomeModal));
