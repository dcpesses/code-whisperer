import PropTypes from 'prop-types';
import GameQueuePlayer from '../game-queue-player';

function GameQueue({label}) {
  let isPlaying = (label.indexOf('play') !== -1);
  return (
    <div className="queue my-1 px-md-1 col-12 col-md-6">
      <div className="bg-body rounded shadow-sm p-2">
        <h6 className="pb-2 m-2 mb-0 libre-franklin-font text-dark-emphasis text-uppercase">{label}</h6>
        <div className="d-flex flex-column text-body">
          <GameQueuePlayer isPlaying={isPlaying} displayName="Mattitude1233" />
          <GameQueuePlayer isPlaying={isPlaying} displayName="dcpesses" />
          <GameQueuePlayer isPlaying={isPlaying} displayName="kellacat" />
        </div>
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
