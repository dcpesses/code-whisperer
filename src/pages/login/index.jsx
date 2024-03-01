import React, {Component} from 'react';
import {version} from '../../../package.json';

import logo from '@/assets/new-logo.svg';
import './login.css';

const scopes = 'chat:read chat:edit moderation:read user:manage:whispers';
const loginUrl = 'https://id.twitch.tv/oauth2/authorize'
    + `?client_id=${import.meta.env.VITE_APP_TWITCH_CLIENT_ID}`
    + `&response_type=code&scope=${scopes}`
    + `&redirect_uri=${import.meta.env.VITE_APP_REDIRECT_URI}`;

class Login extends Component {

  render() {
    return (
      <div id="login-screen" className="container full-pg fade-in">
        <div className="text-center pb-4">
          <img src={logo} className="login-logo w-50 mx-auto mb-4" alt="Logo" />
        </div>

        <a href={loginUrl} className="btn btn-sm fs-2 py-2 px-3 rounded-4">
          Log In With <strong>Twitch</strong>
        </a>

        <div>
          <small>
            {`v${version}`}
          </small>
        </div>
      </div>
    );
  }
}

export default Login;
