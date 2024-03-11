import PropTypes from 'prop-types';

function GameQueuePlayer({displayName, isPlaying}) {
  let sendToggleLabel = !isPlaying
    ? 'Add to Playing'
    : 'Mark Interested';
  return (
    <div className="px-2 py-3 mb-0 small lh-1 border-bottom w-100 raleway-font fw-medium border rounded bg-dark-subtle">
      <div className="d-flex justify-content-between">
        <div>
          <strong className="text-body-emphasis fs-4 saira-condensed fw-bold">
            {displayName}
          </strong>
          <span className="text-info-emphasis d-block smaller fw-semibold">
            9 mins ago
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
};

GameQueuePlayer.defaultProps = {
  displayName: '',
  isPlaying: false,
};

export default GameQueuePlayer;
