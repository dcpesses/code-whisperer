
import PropTypes from 'prop-types';
// import {getRelativeTimeString} from '@/utils';

function PlayerQueueCard({btnProps, onRemoveUser, onSendCode, prioritySeat, relativeTime, showSendButton, username}) {

  let btnSendCode;

  let usernameColorClassName = 'text-body-emphasis';
  let redemptionIndicator;

  if (prioritySeat === true) {
    usernameColorClassName = 'text-warning-emphasis';
    redemptionIndicator = (
      <span title="Priority seat redemption" className="align-self-center">&#9733;</span>
    );
  }
  if (showSendButton) {
    btnSendCode = (
      <button
        className="btn btn-sm btn-info send-code"
        onClick={ onSendCode }
        disabled={ !onSendCode }
      >
        Send
      </button>
    );
  }

  // let relativeTime = '';
  // if (userObj['tmi-sent-ts']) {
  //   relativeTime = getRelativeTimeString(parseInt(userObj['tmi-sent-ts'], 10)); // 'xx mins ago'
  // }
  return (
    <div className="game-queue-player p-2 mb-0 small lh-1 border-bottom w-100 raleway-font fw-medium border rounded bg-dark-subtle">
      <div className="d-flex justify-content-between">
        <div className="d-flex flex-row">
          <button className="btn btn-sm btn-link text-decoration-none p-1 lh-1" onClick={onRemoveUser} title="Remove">&#128683;</button>
          {' '}
          <div className="flex-column ms-1">
            <strong className={`${usernameColorClassName} fs-4 saira-condensed fw-bold`}>
              {username} {redemptionIndicator}
            </strong>
            <span className="text-info-emphasis d-block smaller fw-semibold">
              {relativeTime}
              {/* 9 mins ago */}
            </span>
          </div>
        </div>
        <div className="d-flex flex-row">
          <button className="btn btn-secondary btn-sm fw-semibold" onClick={btnProps.onClick}>
            {btnProps.label}
          </button>
          {btnSendCode}
        </div>
      </div>
    </div>
  );
}

PlayerQueueCard.propTypes = {
  btnProps: PropTypes.object,
  onRemoveUser: PropTypes.func,
  onSendCode: PropTypes.func,
  prioritySeat: PropTypes.bool,
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
  prioritySeat: false,
  relativeTime: null,
  showSendButton: false,
  username: null,
};

export default PlayerQueueCard;
