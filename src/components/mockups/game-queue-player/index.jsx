import PropTypes from 'prop-types';
import {getRelativeTimeString} from '@/utils';

function GameQueuePlayer({displayName, time, isPlaying}) {
  const sendToggleLabel = !isPlaying
    ? 'Add to Playing'
    : 'Mark Interested';

  // const rtf1 = new Intl.RelativeTimeFormat('en', { style: 'short' });
  const relativeTime = getRelativeTimeString(time);

  return (
    <div className="px-2 py-3 mb-0 small lh-1 border-bottom w-100 raleway-font fw-medium border rounded bg-dark-subtle">
      <div className="d-flex justify-content-between">
        <div>
          <strong className="text-body-emphasis fs-4 saira-condensed fw-bold">
            {displayName}
          </strong>
          <span className="text-info-emphasis d-block smaller fw-semibold">
            {relativeTime}
            {/* 9 mins ago */}
          </span>
        </div>
        <button className="btn btn-secondary btn-sm fw-semibold">{sendToggleLabel}</button>
      </div>
    </div>
  );
}

GameQueuePlayer.propTypes = {
  displayName: PropTypes.string,
  isPlaying: PropTypes.bool,
  time: PropTypes.number,
};

GameQueuePlayer.defaultProps = {
  displayName: '',
  isPlaying: false,
  time: 0,
};

export default GameQueuePlayer;
