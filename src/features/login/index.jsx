import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ModalChangelog from '@/features/modal-changelog';
import {version} from '../../../package.json';

import logo from '@/assets/new-logo.svg';
import './login.css';

export const scopes = [
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
];

export const getLoginUrl = () => {
  localStorage.removeItem('__error_msg');
  return 'https://id.twitch.tv/oauth2/authorize'
  + `?client_id=${import.meta.env.VITE_APP_TWITCH_CLIENT_ID}`
  + `&response_type=code&scope=${scopes.join(' ')}`
  + `&redirect_uri=${import.meta.env.VITE_APP_REDIRECT_URI}`;
};

class Login extends Component {
  constructor() {
    super();
    this.state = {
      login_status: localStorage.getItem('__error_msg') || '',
      showChangelogModal: false,
      showClearStatus: false,
      showConfirmClearLocalStorageData: false
    };
    this.checkmarkInt = 0;
  }

  componentWillUnmount() {
    clearTimeout(this.checkmarkInt);
  }

  clearLocalStorageData = () => {
    window.localStorage.clear();
    this.setState({
      showClearStatus: true,
      showConfirmClearLocalStorageData: false,
    });
    const fadeOut = () => {
      this.setState({
        showClearStatus: false,
      });
    };
    this.checkmarkInt = setTimeout(fadeOut, 5000);
  };

  hideClearLocalStorageDataModal = () => {
    this.setState({
      showConfirmClearLocalStorageData: false,
    });
  };

  toggleChangelogModal = () => {
    this.setState((state) => ({
      showChangelogModal: !state.showChangelogModal
    }));
  };

  showClearLocalStorageDataModal = () => {
    this.setState({
      showConfirmClearLocalStorageData: true,
    });
  };

  render() {
    let loginUrl = getLoginUrl();
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
      <div id="login-screen" className="container-fluid d-flex flex-column">

        <div id="landing" className="row row-cols-auto align-items-center justify-content-center">
          <div className="col-8 col-md-6 text-center align-self-end align-self-md-center">

            <div className="text-center pt-1 pb-2">

              <div>
                <img src={logo} className="login-logo w-50 mx-auto mb-3" alt="Code Whisperer Logo" />
              </div>

              <h2 className="text-center mb-0">
                Code Whisperer
              </h2>

              <div className="text-center fs-6" title={window.lastUpdated}>
                <small className="d-block">{`Version ${version}`}</small>
                <Button className="px-2 py-0 m-0 border-0 rounded-4 small" size="sm" onClick={this.toggleChangelogModal}>
                  View Changelog
                </Button>
              </div>

            </div>
          </div>

          <div className="col-9 col-md-6 text-center align-self-start align-self-md-center">

            {loginStatus}

            <a href={loginUrl} className="btn btn-sm fs-2 py-2 px-3 rounded-4 bg-gradient focus-ring" role="button" tabIndex="0">
              Log In With <strong>Twitch</strong>
            </a>

            <div className="text-center fs-6">

              <button className="btn btn-sm btn-link link-secondary text-decoration-none" tabIndex="0" onClick={this.showClearLocalStorageDataModal}>
                Having issues? <span className={checkmarkClassName}>
                  Reset application data
                </span>
              </button>

            </div>

          </div>

        </div>
        <Modal id="modal-confirm-clear-localstorage-data"
          show={this.state.showConfirmClearLocalStorageData}
          dialogClassName="modal-90w" onHide={this.hideClearLocalStorageDataModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Reset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to reset the application data? This will permanently erase any of your saved settings from this browser for Code Whisperer.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.hideClearLocalStorageDataModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={this.clearLocalStorageData}>Reset</Button>
          </Modal.Footer>
        </Modal>
        <ModalChangelog
          handleClose={this.toggleChangelogModal}
          show={this.state.showChangelogModal}
        />
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
