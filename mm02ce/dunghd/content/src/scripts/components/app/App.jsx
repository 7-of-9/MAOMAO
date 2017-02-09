import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ToggleDisplay from 'react-toggle-display';
import ReactMaterialUiNotifications from 'react-materialui-notifications';
import moment from 'moment';
import html2canvas from 'html2canvas';
import StackBlur from 'stackblur-canvas';
import $ from 'jquery';
import { WelcomeModal, ShareModal } from '../modal';
import Score from './Score';
import createUser from '../utils/UserApi';

window.jQuery = $;

require('../../stylesheets/animate.min.css');
require('../../stylesheets/main.scss');
require('../../vendors/vague');
require('../../vendors/jquery.fittext');
require('../../vendors/jquery.lettering');
require('../../vendors/jquery.textillate');

const propTypes = {
    auth: PropTypes.object,
    score: PropTypes.object,
    icon: PropTypes.object,
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
        };
        this.onClose = this.onClose.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.openInvite = this.openInvite.bind(this);
        this.closeInvite = this.closeInvite.bind(this);
        this.notify = this.notify.bind(this);
    }

    componentDidMount() {
        /* Option 1: vague
        const $window = $(window);
        const $blurred = $('.blurred');
        $('body').clone().appendTo($blurred.find('#html2canvas'));
        const vague = $blurred.find('#html2canvas').Vague({
            intensity: 5,
        });

        vague.blur();

        const scrollIframe = () => {
            $blurred.find('#html2canvas').css({
                top: -$blurred.offset().top,
            });
        };
        $window.on('scroll', scrollIframe);

        scrollIframe();
        */
        const $window = $(window);
        const $blurred = $('.blurred');
        html2canvas(document.body).then((canvas) => {
            $('#html2canvas').append(canvas);
            $('canvas').attr('id', 'canvas');
            StackBlur.canvasRGB(canvas, 0, 0, $('canvas').width(), $('canvas').height(), 20);
            const scrollIframe = () => {
                $('canvas').css('-webkit-transform', 'translatey(-' + $blurred.offset().top + 'px)');
            };
            $window.on('scroll', scrollIframe);
        });
    }

    onLogin() {
        this.notify({
            title: 'Prepare to login!',
            autoHide: 1000,
            timestamp: moment().format('h:mm A'),
        });
        this.props.dispatch(checkAuth())
            .then((token) => {
                console.log('token', token);
                if (token) {
                    return createUser(`${this.props.apiUrl}/users/google`, {
                        email: token.info.email,
                        firstName: token.info.family_name,
                        lastName: token.info.given_name,
                        avatar: token.info.picture,
                        gender: token.info.gender,
                        google_user_id: token.info.sub,
                    });
                }
                throw new Error(this.props.auth.message);
            })
            .then((user) => {
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
            .catch((err) => {
                console.warn(err);
                this.notify({
                    title: err.message,
                    autoHide: 3000,
                    timestamp: moment().format('h:mm A'),
                });
            });
    }

    onClose() {
        this.props.dispatch({
            type: 'CLOSE_MODAL',
        });
    }

    onLogout() {
        console.log('onLogout');
        this.props.dispatch(logout())
            .then((token) => {
                console.log(token);
                this.props.dispatch({
                    type: 'USER_AFTER_LOGOUT',
                });
            })
            .catch(err => console.warn(err));
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
            <div className='maomao-ext-component'>
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
                <ToggleDisplay if={this.props.auth.isLogin}>
                    <ShareModal
                        auth={this.props.auth}
                        mailgunKey={this.props.mailgunKey}
                        siteUrl={this.props.siteUrl}
                        isOpen={this.state.openShare}
                        onCloseModal={this.closeInvite}
                        notify={this.notify}
                    />
                </ToggleDisplay>
                <ToggleDisplay if={this.props.auth.isLogin && this.props.score.isOpen && this.props.score.im_score > 0}>
                    <Score imscoreByUrl={this.imscoreByUrl} score={this.props.score} />
                </ToggleDisplay>
                <div className='blurred'>
                    <div id='html2canvas'></div>
                    <p>{this.props.icon.text} {this.props.icon.score} XP</p>
                </div>
            </div>
        );
    }
}

App.propTypes = propTypes;

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        isOpen: state.modal,
        score: state.score,
        icon: state.icon,
    };
};

export default connect(mapStateToProps)(App);
