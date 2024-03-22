import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Cake2Fill, Trash3Fill, PlusCircleFill, XCircleFill, ArrowRightSquareFill } from 'react-bootstrap-icons';
import {getRelativeTimeString} from '@/utils';

function PlayerQueueCard({btnProps, onRemoveUser, onSendCode, queueName, prioritySeat, relativeTime, showSendButton, username}) {
  const [isExtended, setExtended] = useState(false);
  const toggleExtended = () => setExtended(!isExtended);

  const { info } = useSelector((state) => state.users);
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
        className="btn btn-icon send-code"
        onClick={ onSendCode }
        disabled={ !onSendCode }
      >
        <ArrowRightSquareFill />
      </button>
    );
  }

  const btnRemove = (
    <button className="btn btn-icon" onClick={onRemoveUser} title="Remove">
      <Trash3Fill color="#f87171" />
    </button>
  );

  let btnIcon;
  if (queueName === 'playing') {
    btnIcon = (<XCircleFill className="text-purple-3" />);
  }
  if (queueName === 'interested') {
    btnIcon = (<PlusCircleFill className="text-purple-4" />);
  }
  let btnAction = (
    <button className="btn btn-icon" onClick={btnProps.onClick} title={btnProps.label}>
      {btnIcon}
    </button>
  );

  /*const popover = (
    <Popover id="popover-user-info">
      <Popover.Header as="h3">{img} {display_name}</Popover.Header>
      <Popover.Body className="pt-2">
        <div className="pb-2">
          <small><Cake2Fill /> {created_at} ({relativeCreatedAt})</small>
        </div>
        <div>
          <button className="btn btn-sm btn-danger" onClick={onRemoveUser} title="Remove">
            Remove from Queues
          </button>
        </div>
      </Popover.Body>
    </Popover>
  );*/

  const extendedClassName = (isExtended) ? 'd-block' : 'd-none';

  return (
    <div className="player-queue-card p-2 mb-0 small lh-1 border-bottom w-100 raleway-font fw-medium border rounded bg-dark-subtle">
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
      <div className={`player-queue-card-info border-top mt-2 pt-2 px-1 lh-base ${extendedClassName}`}>
        <span className="d-block">
          <Cake2Fill color="pink" aria-label="cake icon" /> {created_at} <span className="text-purple-2">({relativeCreatedAt})</span>
        </span>
        <div className="pt-2 fw-semibold lh-sm">{description}</div>
        <div className="d-block mx-auto pt-2 text-center">
          <a href={`https://www.twitch.com/${username}`} className="d-inline-block ttv-link fw-bold" target="_blank" rel="noreferrer">View Profile</a>
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
