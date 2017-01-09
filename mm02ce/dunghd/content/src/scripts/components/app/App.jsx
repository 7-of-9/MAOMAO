import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import ReactMaterialUiNotifications from 'react-materialui-notifications';
import { Card, CardHeader, CardText } from 'material-ui/Card';

const style = {
  margin: 0,
  top: 'auto',
  right: 20,
  bottom: 20,
  left: 'auto',
  position: 'fixed',
};

import moment from 'moment';
import $ from 'jquery';
import { WelcomeModal, ShareModal } from '../modal';
import createUser from '../utils/UserApi';

window.jQuery = $;

require('../../stylesheets/animate.min.css');
require('../../stylesheets/main.scss');
require('../../vendors/jquery.fittext');
require('../../vendors/jquery.lettering');
require('../../vendors/jquery.textillate');

const propTypes = {
  auth: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  siteUrl: PropTypes.string,
  mailgunKey: PropTypes.string,
  apiUrl: PropTypes.string,
  googleApiKey: PropTypes.string,
  clientId: PropTypes.string,
  webClientId: PropTypes.string,
  dispatch: PropTypes.func,
};

const checkAuth = () => {
  const data = {
    type: 'AUTH_LOGIN',
    payload: {},
  };
  return data;
};

const logout = () => {
  const data = {
    type: 'AUTH_LOGOUT',
    payload: {},
  };
  return data;
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      openShare: false, // hide on loading, trigger show login by ctx
      expanded: false,
    };
    this.onClose = this.onClose.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.openInvite = this.openInvite.bind(this);
    this.closeInvite = this.closeInvite.bind(this);
    this.notify = this.notify.bind(this);
    this.handleExpandChange = this.handleExpandChange.bind(this);
  }

  onLogin() {
    ReactMaterialUiNotifications.showNotification({
      title: 'Prepare to login!',
      autoHide: 1000,
      timestamp: moment().format('h:mm A'),
    });
    this.props.dispatch(checkAuth())
      .then(token => {
        console.log('token', token);
        return createUser(`${this.props.apiUrl}/users/google`, {
          email: token.info.email,
          firstName: token.info.family_name,
          lastName: token.info.given_name,
          avatar: token.info.picture,
          gender: token.info.gender,
          google_user_id: token.info.sub,
        });
      })
      .then(user => {
        console.log('user', user);
        let userId = -1;
        if (user.data && user.data.id) {
          userId = user.data.id;
        }
        this.props.dispatch({
          type: 'USER_AFTER_LOGIN',
          payload: {
            userId,
          },
        });
      })
      .catch(err => console.warn(err));
  }

  onClose() {
    this.props.dispatch({
      type: 'CLOSE_MODAL',
    });
  }

  onLogout() {
    console.log('onLogout');
    this.props.dispatch(logout())
      .then(token => {
        console.log(token);
        this.props.dispatch({
          type: 'USER_AFTER_LOGOUT',
        });
      })
      .catch(err => console.warn(err));
  }

  handleExpandChange(expanded) {
    this.setState({ expanded });
  }

  notify(msg) {
    console.log('notify msg', msg);
    ReactMaterialUiNotifications.showNotification(msg);
    this.forceUpdate();
  }

  closeInvite() {
    this.setState({
      openShare: false,
    });
  }

  openInvite() {
    this.setState({
      openShare: true,
    });
  }

  render() {
    return (
      <div className="maomao-ext-component">
        <ReactMaterialUiNotifications
          rootStyle={{
            zIndex: 10000,
            top: 20,
            right: 25,
          }}
          desktop
          transitionAppear={false}
          transitionLeave={false}
          />
        <WelcomeModal
          auth={this.props.auth}
          onLogin={this.onLogin}
          onClose={this.onClose}
          onLogout={this.onLogout}
          openInvite={this.openInvite}
          isShareOpen={this.state.openShare}
          isOpen={this.props.isOpen}
          />
        <ToggleDisplay show={this.props.auth.isLogin}>
          <ShareModal
            auth={this.props.auth}
            mailgunKey={this.props.mailgunKey}
            siteUrl={this.props.siteUrl}
            isOpen={this.state.openShare}
            onCloseModal={this.closeInvite}
            notify={this.notify}
            />
          <Card style={style} expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
            <CardHeader
              title="IM SCORE"
              subtitle="0.0"
              actAsExpander
              showExpandableButton
              />
            <CardText expandable>
              Time on tab: 0
            </CardText>
            <CardText expandable>
              Ping audible:0
            </CardText>
          </Card>
        </ToggleDisplay>
      </div>
    );
  }
}

App.propTypes = propTypes;

const mapStateToProps = (state) => {
  console.log('state', state);
  return {
    auth: state.auth,
    isOpen: state.modal,
  };
};

export default connect(mapStateToProps)(App);
