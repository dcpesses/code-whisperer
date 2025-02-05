import React, {Component} from 'react';
import {version} from '../../../package.json';

import logo from '@/assets/new-logo.svg';
import twitchChat from '@/assets/twitch-chat.png';
import screenshot2 from '@/assets/screenshot2.png';
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

    const githubCorner = (
      <a href="https://github.com/dcpesses/code-whisperer" className="github-corner" aria-label="View source on GitHub">
        <svg width="80" height="80" viewBox="0 0 250 250" style={{fill:'#fff', color:'#151513', position: 'absolute', top: 0, border: 0, right: 0}} aria-hidden="true">
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"/>
          <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{transformOrigin: '130px 106px'}} className="octo-arm"/>
          <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" className="octo-body"/>
        </svg>
      </a>
    );

    return (
      <div id="login-screen" className="container-md full-pg fade-in">

        {githubCorner}

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

        <div className="row align-items-center justify-content-center mb-4 row-info">
          <div className="col">

            <div className="pb-1">

              <div className="">
                <h1 className="fw-bold">Play With Friends,</h1>
                <h1 className="fw-bold">Not Your Foes!</h1>

                <div className="fs-5 my-4">
                  Developed as a way to help streamers thwart Jackbox trolls, this tool gives Twitch streamers the power to decide who can play in games they host by sending invites only to approved users.
                </div>

                <h3>How It Works:</h3>


                <ul className="ps-4 fs-6 my-4">
                  <li className="mb-1">
                    Followers in chat who type <b>!join</b> get added to the <i>Interested</i> lobby.
                  </li>
                  <li className="mb-1">
                    The streamer then adds any or all of them to the <i>Playing</i> section. You can even randomize who gets added too!
                  </li>
                  <li className="mb-1">
                    Once you enter the room code, press <i>Send to Queue</i> to whisper everyone selected to play.
                  </li>
                </ul>


              </div>

            </div>
          </div>

          <div className="col-md-auto text-center">

            <div className="text-right">
              <img src={twitchChat} className="twitch-chat shadow border border-secondary rounded-4 mx-auto mb-3" alt="Twitch Chat" />
            </div>

          </div>

        </div>

        <div className="row-info">
          <img src={screenshot2} className="screenshot img-fluid shadow border border-secondary roounded-4 mx-auto mb-3" alt="App Screenshot" />
        </div>

        <div className="col-md-auto text-center">

          <div className="fs-5 my-3">
            (Oh, and did we mention it&apos;s free to use?*)
          </div>

          <a href={loginUrl} className="btn btn-sm fs-4 py-2 px-3 rounded-4 my-4">
            Go ahead, log in with <strong>Twitch</strong> and take it for a spin!
          </a>

        </div>

        <div className="col-md-8 text-center">

          <div className="fs-5 my-4">
            View <a href="https://github.com/dcpesses/code-whisperer" className="emphasis" rel="noreferrer" target="_blank">Code Whisperer on GitHub</a> for more information, including documentation, planned features, technical support, and ways to contribute.

          </div>


        </div>

        <div className="col-md-auto text-center">

          <div className="fs-6 my-4">
            *Yes seriously, it is free. That said, you&apos;re also welcome to <a href="https://ko-fi.com/V7V6VSUT1" className="emphasis" rel="noreferrer" target="_blank">leave a tip!</a>

            <div className="py-2">
              <a href="https://ko-fi.com/V7V6VSUT1" className="emphasis" rel="noreferrer" target="_blank"><img src="https://camo.githubusercontent.com/70e2ef5e0263b261f9a2a314bb1d6919d1d43292eed117fe8fc766a68c7d96ea/68747470733a2f2f6b6f2d66692e636f6d2f696d672f676974687562627574746f6e5f736d2e737667" /></a>
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
