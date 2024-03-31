import React, {Component} from 'react';
import {version} from '../../../package.json';

import logo from '@/assets/new-logo.svg';
import './login.css';

const scopes = [
  'chat:read',
  'chat:edit',
  'moderation:read', // https://dev.twitch.tv/docs/api/reference#get-moderators
  'user:manage:whispers', // https://dev.twitch.tv/docs/api/reference#send-whisper
  'moderator:read:chatters', // https://dev.twitch.tv/docs/api/reference#get-chatters
  'user:read:moderated_channels', // https://dev.twitch.tv/docs/api/reference#get-moderated-channels
  'channel:read:vips', // https://dev.twitch.tv/docs/api/reference#get-vips
  'channel:read:editors', // https://dev.twitch.tv/docs/api/reference#get-channel-editors
  'moderator:manage:announcements', // https://dev.twitch.tv/docs/api/reference#send-chat-announcement
  'user:read:subscriptions', // https://dev.twitch.tv/docs/api/reference#check-user-subscription
].join(' ');

class Login extends Component {
  constructor() {
    super();
    this.state = {
      login_status: localStorage.getItem('__error_msg') || '',
      showClearStatus: false,
    };
    this.checkmarkInt = 0;
  }

  componentWillUnmount() {
    clearTimeout(this.checkmarkInt);
  }

  getLoginUrl = () => {
    localStorage.removeItem('__error_msg');
    return 'https://id.twitch.tv/oauth2/authorize'
    + `?client_id=${import.meta.env.VITE_APP_TWITCH_CLIENT_ID}`
    + `&response_type=code&scope=${scopes}`
    + `&redirect_uri=${import.meta.env.VITE_APP_REDIRECT_URI}`;
  };

  clearLocalStorageData = () => {
    window.localStorage.clear();
    this.setState({
      showClearStatus: true,
    });
    const fadeOut = () => {
      this.setState({
        showClearStatus: false,
      });
    };
    this.checkmarkInt = setTimeout(fadeOut, 5000);
  };

  render() {
    let loginUrl = this.getLoginUrl();
    let loginStatus = (this.state.login_status && import.meta.env.DEV) ? (
      <div>
        <code className="small w-50 fs-6 mb-3">
          Error: {this.state.login_status}
        </code>
      </div>
    ) : null;

    let checkmarkClassName = 'with-checkmark';
    if (this.state.showClearStatus) {
      checkmarkClassName = 'with-checkmark checkmark-display';
    }

    return (
      <div id="login-screen" className="container full-pg fade-in">
        <div className="text-center pb-4">
          <img src={logo} className="login-logo w-50 mx-auto mb-4" alt="Logo" />
        </div>

        {loginStatus}

        <a href={loginUrl} className="btn btn-sm fs-2 py-2 px-3 rounded-4">
          Log In With <strong>Twitch</strong>
        </a>

        <div>
          <div className="text-center">
            <small>
              {`v${version}`}
            </small>
          </div>

          <button className="btn btn-sm btn-link link-secondary text-decoration-none" onClick={this.clearLocalStorageData}>
            Having issues? <span className={checkmarkClassName}>
              Reset application data
            </span>
          </button>
        </div>

        <p className="last-updated">
          <small>
            { window.lastUpdated }
          </small>
        </p>

      </div>
    );
  }
}

export default Login;
