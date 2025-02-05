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

export const getLoginUrl = () => {
  localStorage.removeItem('__error_msg');
  return 'https://id.twitch.tv/oauth2/authorize'
  + `?client_id=${import.meta.env.VITE_APP_TWITCH_CLIENT_ID}`
  + `&response_type=code&scope=${scopes}`
  + `&redirect_uri=${import.meta.env.VITE_APP_REDIRECT_URI}`;
};

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
      <div id="login-screen" className="container-md full-pg fade-in">

        <div id="landing" className="row row-cols-auto align-items-center justify-content-center mt-5">
          <div className="col text-center">

            <div className="text-center pb-1">

              <div>
                <img src={logo} className="login-logo w-50 mx-auto mb-3" alt="Logo" />
              </div>

              <h2 className="text-center mb-0">
                Code Whisperer
              </h2>

              <div className="text-center fs-6" title={window.lastUpdated}>
                <small>{`v${version}`}</small>
              </div>

            </div>
          </div>

          <div className="col text-center">

            {loginStatus}

            <a href={loginUrl} className="btn btn-sm fs-2 py-2 px-3 rounded-4 bg-gradient">
              Log In With <strong>Twitch</strong>
            </a>

            <div className="text-center fs-6">

              <button className="btn btn-sm btn-link link-secondary text-decoration-none" onClick={this.clearLocalStorageData}>
                Having issues? <span className={checkmarkClassName}>
                  Reset application data
                </span>
              </button>

            </div>

          </div>

        </div>

        {/* <p className="last-updated">
          <small>
            { window.lastUpdated }
          </small>
        </p> */}

      </div>
    );
  }
}

export default Login;
