/* eslint-disable react/no-unused-state */
/* eslint-disable no-console */
import React, {Component} from 'react';
import LoadingRipple from '@/components/loading-ripple';
import {Navigate} from 'react-router-dom';
import Login from '@/pages/login';
import TwitchApi from '@/api/twitch';
import {withRouter, Debounce} from '@/utils';
import MainScreen from '@/components/main-screen';

const TWITCH_API = new TwitchApi({
  redirectUri: import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE,
  clientId: import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
  clientSecret: import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET,
  debug: true,
  init: false
});

class AuthenticatedApp extends Component {
  constructor() {
    super();
    this.state = {
      userInfo: {},
      username: localStorage.getItem('__username') || '',
      user_id: localStorage.getItem('__user_id') || 0,
      profile_image_url: localStorage.getItem('__profile_image_url') || '',
      accessToken: localStorage.getItem('__access_token') || '',
      auth_pending: false,
      failed_login: false,
      has_logged_out: false,
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
    this.setState({
      username: userInfo.login,
      user_id: userInfo.id,
      // modList,
      profile_image_url: userInfo.profile_image_url,
      auth_pending: false,
      failed_login: false,
    });
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

  handleUsername = async() => {
    try {
      await this.twitchApi.validateToken();
      const login = this.state.username;
      console.log('handleUsername', {login});
      const userInfo = await this.twitchApi.requestUserInfo({login});
      console.log({userInfo: JSON.stringify(userInfo)});
      this.setState({
        userInfo,
        username: userInfo.data[0].login,
        user_id: userInfo.data[0].id,
        profile_image_url: userInfo.data[0].profile_image_url,
      });
    } catch (e) {
      console.log('handleUsername: error', e);
      this.logOut();
    }
  };

  updateUsername = (username) => {
    this.setState({username}, this.handleUsername);
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
          modList={this.state.modList}
          onLogOut={this.logOut}
          profile_image_url={this.state.profile_image_url}
          twitchApi={this.twitchApi}
          userInfo={this.state.userInfo}
          user_id={this.state.user_id}
          username={this.state.username}
          updateUsername={this.updateUsername}
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

export default withRouter(AuthenticatedApp);
