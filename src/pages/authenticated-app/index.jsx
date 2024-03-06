/* eslint-disable react/no-unused-state */
/* eslint-disable no-console */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import LoadingRipple from '@/components/LoadingRipple';
import {Navigate} from 'react-router-dom';
import TwitchApi from '@/api/twitch';
import {withRouter} from '@/utils';
import queryString from 'query-string';

class AuthenticatedApp extends Component {
  static get propTypes() {
    return {
      location: PropTypes.object,
      router: PropTypes.object.isRequired
    };
  }

  static get defaultProps() {
    return {
      location: {}
    };
  }

  constructor() {
    super();
    this.state = {
      username: localStorage.getItem('__username'),
      user_id: localStorage.getItem('__user_id'),
      profile_image_url: localStorage.getItem('__profile_image_url'),
      access_token: localStorage.getItem('__access_token'),
      expires_in: localStorage.getItem('__expires_in') || 0,
      expiry_time: localStorage.getItem('__expiry_time') || 0,
      refresh_token: localStorage.getItem('__refresh_token'),
      failed_login: false,
      has_logged_out: false
    };

    this.twitchApi = new TwitchApi({
      redirectUri: import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE,
      clientId: import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
      clientSecret: import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET,
    });

    this.getAuth = this.getAuth.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.logOut = this.logOut.bind(this);
    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.promisedSetState = this.promisedSetState.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.hasAlreadyInit = false;
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    if (!this.state.access_token) {
      // console.log('authenticated-app - componentDidMount -> getAuth');
      return this.getAuth();
    } else {
      return this.getUsers(this.state.access_token)
        .catch(e => {
          console.error(e);
          return this.getAuth(e);
        });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    // console.log('authenticated-app - componentWillUnmount');
  }

  async getAuth(e) {
    if (e) {
      console.error(e);
    }

    this.twitchApi.resetLocalStorageItems();
    localStorage.removeItem('__error_msg');

    const queryParams = queryString.parse(this.props.router.location.search);

    return await this.twitchApi.requestAuthentication({code: queryParams.code})
      .then((oauth) => {

        if (oauth.status >= 300 && oauth.message) {
          localStorage.setItem('__error_msg', oauth.message);
        }
        //console.log(oauth);  access_token, refresh_token, expires_in, scope ['...']
        if (this._isMounted) {
          if (!oauth.access_token) {
            return this.setState({
              failed_login: true
            });
          }
          return this.onAuthenticated(oauth);
        }
        return;
      })
      .catch(e => {
        console.error(e, 'failed_login');
        if (this._isMounted) {
          return this.setState({
            failed_login: true
          });
        }
        return;
      });
  }

  async getUserInfo(username) {
    const userInfo = await this.twitchApi.requestUserInfo({login: username});
    console.log({userInfo: JSON.stringify(userInfo)});
  }

  async getUsers(access_token) {
    const userInfo = await this.twitchApi.requestUsers(access_token);
    console.log({userInfo: JSON.stringify(userInfo)}); // login [aka lowercase username?], display_name, profile_image_url, description

    const modInfo = await this.twitchApi.requestModerators(userInfo.data[0].id);
    const modList = (!modInfo.data)
      ? null
      : modInfo.data.map(
        (modObj) => (!modObj.user_name)
          ? null
          : modObj.user_name.toLowerCase()
      ).filter(user => user);
    if (this._isMounted) {
      return this.promisedSetState({
        username: userInfo.data[0].login,
        user_id: userInfo.data[0].id,
        modList,
        profile_image_url: userInfo.data[0].profile_image_url
      });
    }
    return;
  }

  async logOut() {
    this.twitchApi.resetLocalStorageItems();

    try {
      await this.twitchApi.logOut();
      localStorage.removeItem('__error_msg');
      // return redirect('/login');
      return window.location.reload();
    } catch {
      return (<Navigate to="/login" />);
    }
  }

  /**
     * Handles the API response after authenticating
     *
     * @param {object} oauth The api response object (access_token, refresh_token, expires_in, scope)
     * @returns Promise (via getUsers)
     */
  onAuthenticated(oauth) {
    window.location.assign('#');

    this.setState({
      access_token: oauth.access_token,
      expires_in: oauth.expires_in,
      expiry_time: this.twitchApi.expiry_time,
      refresh_token: oauth.refresh_token
    });

    return this.getUsers();
  }

  promisedSetState = (newState) => new Promise(resolve => this.setState(newState, resolve));

  async refreshToken() {
    console.log('refreshToken');
    let token = this.state.refresh_token;
    return await this.twitchApi.requestRefreshToken(token)
      .then(this.onAuthenticated)
      .catch(e => {
        console.error(e);
        return this.logOut();
      });
  }


  handleUsernameInputChange = (e) => {
    return this.setState({
      username: e.target.value
    });
  };

  handleUsername = () => {
    this.getUserInfo(this.state.username);
  };

  render() {
    if (this.state.failed_login /*|| this.state.has_logged_out === true*/) {
      return (<Navigate to="/login"/>);
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

    let classNames = ['authenticated-app', 'container', 'text-center'];
    if (this.state.username && this.state.modList) {
      let img;
      if (this.state.profile_image_url) {
        img = (
          <img src={this.state.profile_image_url} className="rounded-circle" alt={this.state.username} style={{maxHeight: 'calc(20px + 2vmin)'}} />
        );
      }
      mainContent = (
        <div className="col full-pg">
          <h2 className="text-center">Authenticated!</h2>
          <div>
            <input type="text" value={this.state.username} onChange={this.handleUsernameInputChange} placeholder="Enter a Streamer" />
            <button onClick={this.handleUsername}>
              Load
            </button>
          </div>
          <div>
            <div>profile_image_url: {img}</div>
            <div>channel: {this.state.username} | {this.twitchApi.username}</div>
            <div>id: {this.state.user_id} | {this.twitchApi.userId}</div>
            <div>access_token: {this.state.access_token} | {this.twitchApi.accessToken}</div>
            <div>modList: {this.state.modList}</div>
          </div>
          <div className="text-center">
            <button onClick={this.logOut} className="btn btn-primary">Log Out</button>
          </div>
        </div>

      );
    }

    return (
      <div id={classNames.join(' ')}>
        {mainContent}
      </div>
    );
  }
}

export {AuthenticatedApp};

export default withRouter(AuthenticatedApp);
