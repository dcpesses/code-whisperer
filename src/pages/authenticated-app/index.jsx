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
    this.getUsers = this.getUsers.bind(this);
    this.logOut = this.logOut.bind(this);
    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.promisedSetState = this.promisedSetState.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.hasAlreadyInit = false;
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    if (!this.state.access_token) {
      console.log('authenticated-app - componentDidMount -> getAuth');
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
    console.log('authenticated-app - componentWillUnmount');
  }

  async getAuth(e) {
    if (e) {
      console.error(e);
    }
    localStorage.removeItem('__username');
    localStorage.removeItem('__user_id');
    localStorage.removeItem('__profile_image_url');
    localStorage.removeItem('__access_token');
    localStorage.removeItem('__expires_in');
    localStorage.removeItem('__expiry_time');
    localStorage.removeItem('__refresh_token');
    localStorage.removeItem('__error_msg');

    const queryParams = queryString.parse(this.props.router.location.search);

    // const requestParams = new URLSearchParams({
    //   grant_type: 'authorization_code',
    //   code: queryParams.code,
    //   redirect_uri: import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE,
    //   client_id: import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
    //   client_secret: import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET
    // });
    // return await fetch(`https://id.twitch.tv/oauth2/token?${requestParams}`, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/vnd.twitchtv.v5+json'
    //   }
    // })

    return await this.twitchApi.requestAuthentication({code: queryParams.code})
      // .then(r => r.json())
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

  async getUsers(access_token) {
    // const respUsers = await fetch('https://api.twitch.tv/helix/users', {
    //   headers: {
    //     'Client-ID': import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
    //     Authorization: `Bearer ${this.state.access_token}`
    //   }
    // });
    // const userInfo = await respUsers.json();
    const userInfo = await this.twitchApi.requestUsers(access_token);
    console.log({userInfo: JSON.stringify(userInfo)}); // login [aka lowercase username?], display_name, profile_image_url, description
    // if (userInfo.error) {
    //   // throw new Error(userInfo.error, userInfo);
    //   console.error(userInfo);
    //   return Promise.reject(userInfo);
    // }
    localStorage.setItem('__username', userInfo.data[0].login);
    localStorage.setItem('__user_id', userInfo.data[0].id);
    localStorage.setItem('__profile_image_url', userInfo.data[0].profile_image_url);
    // const respMods = await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${userInfo.data[0].id}`, {
    //   headers: {
    //     'Client-ID': import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
    //     Authorization: `Bearer ${access_token}`
    //   }
    // });
    // const modInfo = await respMods.json();
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
    localStorage.removeItem('__username');
    localStorage.removeItem('__user_id');
    localStorage.removeItem('__profile_image_url');
    localStorage.removeItem('__access_token');
    localStorage.removeItem('__expires_in');
    localStorage.removeItem('__expiry_time');
    localStorage.removeItem('__refresh_token');

    // const requestParams = new URLSearchParams({
    //   client_id: import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
    //   token: this.state.access_token,
    //   redirect_uri: import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE
    // });

    try {
      // await fetch(`https://id.twitch.tv/oauth2/revoke?${requestParams}`, {
      //   method: 'POST',
      //   headers: {
      //     Accept: 'application/vnd.twitchtv.v5+json'
      //   }
      // });
      await this.twitchApi.logOut();
      localStorage.removeItem('__error_msg');

      // //   // return redirect('/login');
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
    let expiry_time = Date.now() + oauth.expires_in;
    localStorage.setItem('__access_token', oauth.access_token);
    localStorage.setItem('__expires_in', oauth.expires_in);
    localStorage.setItem('__expiry_time', expiry_time);
    localStorage.setItem('__refresh_token', oauth.refresh_token);

    window.location.assign('#');

    this.setState({
      access_token: oauth.access_token,
      expires_in: oauth.expires_in,
      expiry_time,
      refresh_token: oauth.refresh_token
    });

    return this.getUsers(oauth.access_token);
  }

  promisedSetState = (newState) => new Promise(resolve => this.setState(newState, resolve));

  async refreshToken() {
    console.log('refreshToken');
    let token = this.state.refresh_token;
    // const requestParams = new URLSearchParams({
    //   grant_type: 'refresh_token',
    //   client_id: import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
    //   client_secret: import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET,
    //   refresh_token: token
    // });
    // return await fetch(`https://id.twitch.tv/oauth2/token?${requestParams}`, {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `OAuth ${token}`,
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   }
    // })
    //   .then(r => r.json())
    return await this.twitchApi.requestRefreshToken(token)
      .then(this.onAuthenticated)
      .catch(e => {
        console.error(e);
        return this.logOut();
      });
  }

  async validateToken(token) {
    if (!token) {
      token = this.state.access_token;
    }
    // return await fetch('https://id.twitch.tv/oauth2/validate', {
    //   method: 'GET',
    //   headers: {
    //     Authorization: `OAuth ${token}`
    //   }
    // })
    //   .then(r => r.json())
    return await this.twitchApi.validateToken(token)
      .then(validateResp => {
        if (validateResp.status === 401) {
          console.log('calling this.refreshToken();...');
          return this.refreshToken();
        }
        return Promise.resolve();
      })
      .catch(e => {
        console.error(e);
        if (e.status === 401) {
          console.log('calling this.refreshToken();...');
          return this.refreshToken();
        }
        return;
      });
  }

  render() {
    if (this.state.failed_login /*|| this.state.has_logged_out === true*/) {
      return (<Navigate to="/login"/>);
    }
    {/*
        <div className="text-center">
          <button onClick={this.getAuth} className="btn btn-primary">Get Auth</button>
          <button onClick={this.logOut} className="btn btn-primary">Log Out</button>
        </div>
    */}
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
          <img src={this.state.profile_image_url} className="rounded-circle" alt={this.state.username} />
        );
      }
      mainContent = (
        <div className="col full-pg">
          <h2 className="text-center">Authenticated!</h2>
          <div>
            <div>channel: {this.state.username}</div>
            <div>id: {this.state.user_id}</div>
            <div>modList: {this.state.modList}</div>
            <div>access_token: {this.state.access_token}</div>
          </div>
          <div className="text-center">
            <button onClick={this.logOut} className="btn btn-primary">Log Out</button>
          </div>
        </div>

      );
    }

    return (
      <div id={classNames.join(' ')}>
        {/* <div className="row justify-content-center align-items-center"> */}
        {mainContent}
        {/* </div> */}
      </div>
    );
  }
}

export {AuthenticatedApp};

export default withRouter(AuthenticatedApp);
