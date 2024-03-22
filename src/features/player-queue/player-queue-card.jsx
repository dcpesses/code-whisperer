import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Alert from 'react-bootstrap/Alert';
import Collapse from 'react-bootstrap/Collapse';
import {getRelativeTimeString} from '@/utils';

import './player-queue-card.css';

function PlayerQueueCard({btnProps, onRemoveUser, onSendCode, queueName, prioritySeat, relativeTime, showSendButton, username}) {
  // Extended Info Pane
  const [isExtended, setExtended] = useState(false);
  const toggleExtended = () => setExtended(!isExtended);
  const extendedToggleBtnProps = (isExtended) ? {
    icon: 'caret-up',
    label: 'View Less',
  } : {
    icon: 'caret-down',
    label: 'View More',
  };

  // Highlight user redeems / priority seat
  let usernameColorClassName = 'text-body-emphasis';
  let redemptionIndicator;

  if (prioritySeat === true) {
    usernameColorClassName = 'text-warning-emphasis';
    redemptionIndicator = (
      <span title="Priority seat redemption" className="align-self-center fs-6">
        <i className="bi-stars" />
      </span>
    );
  }
  // Merge user info with props data
  const { info, whisperStatus } = useSelector((state) => state.users);
  let userInfo = {};
  if (info[username]) {
    userInfo = info[username];
  }
  let img, display_name, created_at, description, relativeCreatedAt;
  if (userInfo?.profile_image_url) {
    img = (
      <img src={userInfo.profile_image_url} className="rounded-circle navbar-pfp-img" alt={userInfo.display_name} />
    );
    display_name = userInfo.display_name;
    created_at = userInfo.created_at;
    description = userInfo.description;

    if (created_at) {
      const creationDate = Date.parse(created_at);
      relativeCreatedAt = getRelativeTimeString(creationDate); // 'xx mins ago'
      created_at = new Date(creationDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  // Only show Send button in Playing column
  // and display status when available
  let userWhisperResponse = whisperStatus[username]?.response || {};
  let sendStatusBadge;
  let sendStatusMessage;
  if (userWhisperResponse?.status) {
    let whisperSuccess = (userWhisperResponse.status === 204);
    if (whisperSuccess) {
      sendStatusBadge = (
        <span className="badge p-0 position-absolute top-0 start-100 translate-middle bg-success rounded-circle">
          <i className="bi-check" />
          <span className="visually-hidden">{userWhisperResponse.msg}</span>
        </span>
      );
    } else {
      sendStatusBadge = (
        <span className="badge position-absolute top-0 start-100 translate-middle bg-danger border border-light rounded-circle">
          <span className="visually-hidden">{userWhisperResponse.msg}</span>
        </span>
      );
    }

    sendStatusMessage = (
      <Alert variant={(whisperSuccess) ? 'success' : 'danger'}>
        <i className={`bi-${(whisperSuccess) ? 'check-circle-fill' : 'exclamation-triangle-fill'}`} /> {userWhisperResponse.msg}
      </Alert>
    );
  }
  let btnSendCode;
  if (showSendButton && queueName === 'playing') {
    btnSendCode = (
      <button
        className="btn btn-icon send-code"
        onClick={ onSendCode }
        disabled={ !onSendCode }
      >
        <i className="bi-arrow-right-square-fill position-relative">
          {sendStatusBadge}
        </i>
      </button>
    );
  }

  const btnRemove = (
    <button className="btn btn-icon remove-user" onClick={onRemoveUser} title="Remove">
      <i className="bi-trash3-fill" />
    </button>
  );

  let btnIcon;
  if (queueName === 'playing') {
    btnIcon = (<i className="bi-x-circle-fill text-purple-3" />);
  }
  if (queueName === 'interested') {
    btnIcon = (<i className="bi-plus-circle-fill text-purple-4" />);
  }
  const btnAction = (
    <button className="btn btn-icon" onClick={btnProps.onClick} title={btnProps.label}>
      {btnIcon}
    </button>
  );

  return (
    <div className="player-queue-card p-2 mb-0 small lh-1 border-bottom w-100 raleway-font fw-medium border rounded bg-dark-subtle position-relative">
      <div className="d-flex justify-content-between">
        <button className="btn btn-base border-0 d-flex flex-row" onClick={toggleExtended} title="View Additional User Information">
          {img}
          {' '}
          <div className="flex-column ms-1 text-start">
            <strong className={`${usernameColorClassName} fs-4 saira-condensed fw-bold d-inline-block`}>
              {display_name} {redemptionIndicator}
            </strong>
            <span className="text-purple-2 d-block smaller fw-semibold">
              {relativeTime}
            </span>
          </div>
        </button>
        <div className="d-flex flex-row">
          {btnRemove}
          {btnAction}
          {btnSendCode}
        </div>
      </div>
      <Collapse in={isExtended} className="extended-info-pane">
        <div id={`player-queue-card-info-${username}`} className="p-0 m-0">
          <div className={'player-queue-card-info border-top mt-2 pt-2 px-1 lh-base'}>
            {sendStatusMessage}
            <span className="d-block">
              <i className="bi-cake2-fill text-purple-2" aria-label="cake icon" /> {created_at} <span className="text-purple-2">({relativeCreatedAt})</span>
            </span>
            <div className="pt-2 fw-semibold lh-sm">{description}</div>
            <div className="d-block mx-auto pt-2">
              <a href={`https://www.twitch.com/${username}`} className="d-inline-block ttv-link fw-bold" target="_blank" rel="noreferrer">View Profile</a>
            </div>
          </div>
        </div>
      </Collapse>
      <div className="d-block text-center position-absolute bottom-0 start-50 translate-middle-x">
        <button className="btn badge rounded-pill user-info-toggle"
          aria-controls={`player-queue-card-info-${username}`}
          aria-expanded={isExtended}
          onClick={toggleExtended}
        >
          {extendedToggleBtnProps.label} <i className={`bi-${extendedToggleBtnProps.icon}-fill `} />
        </button>
      </div>
    </div>
  );
}

PlayerQueueCard.propTypes = {
  btnProps: PropTypes.object,
  onRemoveUser: PropTypes.func,
  onSendCode: PropTypes.func,
  prioritySeat: PropTypes.bool,
  queueName: PropTypes.string,
  relativeTime: PropTypes.string,
  showSendButton: PropTypes.bool,
  username: PropTypes.string,
};

PlayerQueueCard.defaultProps = {
  btnProps: {
    label: '',
    onClick: null,
  },
  onRemoveUser: null,
  onSendCode: null,
  queueName: null,
  prioritySeat: false,
  relativeTime: null,
  showSendButton: false,
  username: null,
};

export default PlayerQueueCard;
