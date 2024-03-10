import GameQueuePlayer from '../game-queue-player';

function GameQueue() {
  return (
    <div id="queue" className="my-3 p-3 bg-body rounded shadow-sm">
      <h6 className="border-bottom pb-2 mb-0 libre-franklin-font text-dark-emphasis">QUEUE</h6>

      <div className="d-flex text-body pt-3">
        <GameQueuePlayer />
      </div>
    </div>
  );
}

export default GameQueue;
