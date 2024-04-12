/* eslint-disable react/no-unused-state */
/* eslint-disable no-console */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import LoadingRipple from '@/components/loading-ripple';
import {Navigate} from 'react-router-dom';
import Login from '@/pages/login';
import TwitchApi from '@/api/twitch';
import {withRouter, Debounce} from '@/utils';
import MainScreen from '@/components/main-screen';
import { clearUserInfo, setModeratedChannels, setUserInfo } from '@/features/player-queue/user-slice.js';
import { clearChannelInfo, clearModerators, clearVIPs, setChannelInfo, setModerators, setVIPs } from '@/features/twitch/channel-slice.js';

export const noop = () => void 0;

const TWITCH_API = new TwitchApi({
  redirectUri: import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE,
  clientId: import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
  clientSecret: import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET,
  debug: true,
  init: false
});

class AuthenticatedApp extends Component {
  static get propTypes() {
    return {
      clearChannelInfo: PropTypes.func,
      clearModerators: PropTypes.func,
      clearUserInfo: PropTypes.func,
      clearVIPs: PropTypes.func,
      setChannelInfo: PropTypes.func,
      setModeratedChannels: PropTypes.func,
      setModerators: PropTypes.func,
      setUserInfo: PropTypes.func,
      setVIPs: PropTypes.func,
    };
  }
  static get defaultProps() {
    return {
      clearChannelInfo: noop,
      clearModerators: noop,
      clearUserInfo: noop,
      clearVIPs: noop,
      setChannelInfo: noop,
      setModeratedChannels: noop,
      setModerators: noop,
      setUserInfo: noop,
      setVIPs: noop,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      username: localStorage.getItem('__username') || '',
      user_id: localStorage.getItem('__user_id') || 0,
      profile_image_url: localStorage.getItem('__profile_image_url') || '',
      accessToken: localStorage.getItem('__access_token') || '',
      auth_pending: false,
      failed_login: false,
      has_logged_out: false,
      moderators: null,
      vips: null,
    };

    this.twitchApi = TWITCH_API;

    this.hasAlreadyInit = false;
    this._isMounted = false;

    this.twitchAuthReady = false;

    this.onDelayedMount = Debounce(this.onMount.bind(this), 50);

    this.showLoginButton = true;
  }

  componentDidMount() {
    this._isMounted = true;
    console.log('authenticated-app - componentDidMount');
    this.onDelayedMount();
  }
  componentWillUnmount() {
    this._isMounted = false;
    this.props.clearChannelInfo();
    this.props.clearModerators();
    this.props.clearUserInfo();
    this.props.clearVIPs();
    this.twitchApi.closeChatClient();
    console.log('authenticated-app - componentWillUnmount');
  }

  promisedSetState = (newState) => new Promise(resolve => this.setState(newState, resolve));

  onMount = async() => {
    if (this._isMounted !== true) {
      console.log('authenticated-app - onDelayedMount: not mounted');
    }
    let accessToken = localStorage.getItem('__access_token');
    let refreshToken = localStorage.getItem('__refresh_token');
    let expiryTime = parseInt(localStorage.getItem('__expiry_time'), 10);
    let currTime = Date.now();
    if (accessToken && accessToken !== 'undefined' && !isNaN(expiryTime)) {
      if (expiryTime > currTime) {
        // try using existing access token
        console.log('onDelayedMount - trying previous token', {
          localStorage: accessToken
        });
        try {
          this.twitchApi.accessToken = accessToken;
          const resumeResponse = await this.twitchApi.resume();
          if (resumeResponse && !resumeResponse.error) {
            console.log('onDelayedMount - successful resume response!', resumeResponse);
            return this.onTwitchAuthInit();
          }
          console.log('onDelayedMount - unexpected resume response', resumeResponse);
        } catch (e) {
          console.log('onDelayedMount - previous init not valid', e);
        }
      } else if (refreshToken) {
        // try using existing refresh token
        console.log('onDelayedMount - trying refresh token', {
          localStorage: refreshToken
        });
        try {
          this.twitchApi.refreshToken = refreshToken;
          const refreshResponse = await this.twitchApi.requestRefreshToken();
          if (refreshResponse && !refreshResponse.error) {
            console.log('onDelayedMount - successful requestRefreshToken response!', refreshResponse);
          }
          const resumeResponse = await this.twitchApi.resume(refreshResponse.access_token, refreshResponse);
          if (resumeResponse && !resumeResponse.error) {
            console.log('onDelayedMount - successful requestRefreshToken response!', resumeResponse);
            return this.onTwitchAuthInit();
          }
          console.log('onDelayedMount - unexpected requestRefreshToken response', resumeResponse);
        } catch (e) {
          console.log('onDelayedMount - previous init not valid', e);
        }
      }
    }
    console.log('onDelayedMount - calling init');
    try {
      const initResponse = await this.twitchApi.init();
      console.log('onDelayedMount - initialized response:', initResponse);
      if (!initResponse) {
        throw 'No response';
      }
      if (initResponse.error) {
        throw initResponse.error;
      }
      return this.onTwitchAuthInit();
    } catch (e) {
      console.log('onDelayedMount - error initializing:', e);
      return this.onTwitchAuthError();
    }
  };

  onTwitchAuthInit = () => {
    let userInfo = this.twitchApi.userInfo;
    console.log('onTwitchAuthInit', {userInfo});
    if (!userInfo?.login) {
      console.log('onTwitchAuthInit - no user info');
      return this.setState({
        auth_pending: false,
        failed_login: true,
      });
    }
    this.props.setUserInfo(userInfo);
    this.props.setChannelInfo(userInfo);
    this.setState({
      username: userInfo.login,
      user_id: userInfo.id,
      profile_image_url: userInfo.profile_image_url,
      auth_pending: false,
      failed_login: false,
    }, this.updateModsAndVIPs);
  };

  onTwitchAuthError = () => {
    console.log('authenticated-app - onTwitchAuthError');
    return this.setState({
      auth_pending: false,
      failed_login: true,
    });
  };

  logOut = async() => {
    console.log('logOut');

    try {
      await this.twitchApi.logOut();
      localStorage.removeItem('__error_msg');
      console.log('logOut: setState - has_logged_out');
      return this.setState({
        has_logged_out: true
      });
    } catch (e) {
      console.log('logOut: error', e);
      return this.setState({
        has_logged_out: true
      });
    }
  };

  updateModeratedChannels = async() => {
    try {
      await this.twitchApi.validateToken();
      const id = this.state.user_id;
      let moderatedChannels = await this.twitchApi.requestModeratedChannels(id);
      if (moderatedChannels.data) {
        this.props.setModeratedChannels(moderatedChannels.data);
      }
    } catch (e) {
      console.warn('updateModeratedChannels: error', e);
    }
  };

  updateModsAndVIPs = async() => {
    try {
      await this.twitchApi.validateToken();
      this.updateModerators();
      this.updateVIPs();
      await this.updateModeratedChannels();
    } catch (e) {
      console.warn('updateModsAndVIPs: error', e);
    }
  };

  updateModerators = async() => {
    const props = this.props;
    try {
      const id = this.state.user_id;
      const moderators = await this.twitchApi.requestModerators(id);
      props.setModerators(moderators);
    } catch (e) {
      console.warn('updateModerators: error', e);
    }
  };

  updateVIPs = async() => {
    try {
      const id = this.state.user_id;
      const vips = await this.twitchApi.requestVIPs(id);
      this.props.setVIPs(vips);
    } catch (e) {
      console.warn('updateVIPs: error', e);
    }
  };

  render = () => {
    if (this._isMounted && (this.state.failed_login === true || this.state.has_logged_out === true)) {
      if (this.showLoginButton) {
        return (<Login />);
      }
      console.log('render: navigate to login');
      return (<Navigate to="/login" />);
    }

    let mainContent = (
      <div className="col display-6 text-center full-pg">
        <div></div>
        <div>
          <LoadingRipple />
          <br />
          Loading...
        </div>
        <div></div>
      </div>
    );

    if (this.state.username && this.twitchApi?.isChatConnected) {
      mainContent = (
        <MainScreen
          access_token={this.twitchApi?.accessToken}
          channel={this.state.username}
          moderators={this.state.moderators}
          onLogOut={this.logOut}
          twitchApi={this.twitchApi}
          vips={this.state.vips}
        />
      );
    }

    return (
      <div id="authenticated-app container text-center">
        {mainContent}
      </div>
    );
  };
}

export {AuthenticatedApp};

const mapDispatchToProps = () => ({
  clearChannelInfo,
  clearModerators,
  clearUserInfo,
  clearVIPs,
  setChannelInfo,
  setModeratedChannels,
  setModerators,
  setUserInfo,
  setVIPs,
});
export default connect(
  null,
  mapDispatchToProps()
)(withRouter(AuthenticatedApp));
