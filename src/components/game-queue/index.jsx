import PropTypes from 'prop-types';
import GameQueuePlayer from '../game-queue-player';

function GameQueue({label}) {
  let isPlaying = (label.indexOf('play') !== -1);
  return (
    <div id="queue" className="my-3 p-2 bg-body rounded shadow-sm">
      <h6 className="pb-2 m-2 mb-0 libre-franklin-font text-dark-emphasis text-uppercase">{label}</h6>

      <div className="d-flex flex-column text-body">
        <GameQueuePlayer isPlaying={isPlaying} displayName="Mattitude1233" />
        <GameQueuePlayer isPlaying={isPlaying} displayName="dcpesses" />
        <GameQueuePlayer isPlaying={isPlaying} displayName="kellacat" />
      </div>
    </div>
  );
}
GameQueue.propTypes = {
  label: PropTypes.string,
};

GameQueue.defaultProps = {
  label: '',
};
export default GameQueue;
