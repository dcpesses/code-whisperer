import React, {Component} from 'react';
import {version} from '../../../package.json';

import logo from '@/assets/new-logo.svg';
import './login.css';

const scopes = 'chat:read chat:edit moderation:read user:manage:whispers';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      login_status: localStorage.getItem('__error_msg') || ''
    };
    if (!import.meta?.env?.VITE_APP_TWITCH_CLIENT_ID) {
      console.log('getLoginUrl: no client id found; listing vars');
      console.log(import.meta.env);
    } else {
      console.log('client id found!');
    }
  }

  getLoginUrl() {
    localStorage.removeItem('__error_msg');
    return 'https://id.twitch.tv/oauth2/authorize'
    + `?client_id=${import.meta.env.VITE_APP_TWITCH_CLIENT_ID}`
    + `&response_type=code&scope=${scopes}`
    + `&redirect_uri=${import.meta.env.VITE_APP_REDIRECT_URI}`;
  }

  render() {
    let loginUrl = this.getLoginUrl();
    let loginStatus = (this.state.login_status && import.meta.env.DEV) ? (
      <div>
        <code className="small w-50 fs-6 mb-3">
          Error: {this.state.login_status}
        </code>
      </div>
    ) : null;

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
          <small>
            {`v${version}`}
          </small>
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
