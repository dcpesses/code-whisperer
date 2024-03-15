import PropTypes from 'prop-types';

import './game-code-form.css';

function GameCodeForm(props) {

  const handleRoomCodeChange = (evt) => {
    let roomCode;
    if (evt.target?.value) {
      roomCode = evt.target.value.trim();
    }
    // this.setState({roomCode});
    props.setRoomCode(roomCode);
  };
  const handleRoomCodeFocus = (evt) => evt.target.select();

  return (
    <div className="d-flex align-items-center p-3 my-3 text-white bg-purple rounded shadow-sm libre-franklin-font col-lg-8 col-xl-7 col-xxl-6">
      <div className="input-group">
        <input type="text" name="room-code" value={props.roomCode || ''}
          autoComplete="false"
          aria-autocomplete="none"
          aria-describedby="btn-send-to-queue"
          aria-label="Enter Room Code"
          className="form-control libre-franklin-font"
          onChange={handleRoomCodeChange}
          onFocus={handleRoomCodeFocus}
          placeholder="ENTER ROOM CODE"
          role="presentation"
          title="Paste Room Code Here"
        />
        <button type="button"
          className="btn btn-primary libre-franklin-font text-uppercase"
          id="btn-send-to-queue"
          onClick={props.sendCodeToAll}
          title="Send Code to All Players"
        >
          Send to Queue
        </button>
      </div>
    </div>
  );
}
GameCodeForm.propTypes = {
  roomCode: PropTypes.string,
  sendCodeToAll: PropTypes.func,
  setRoomCode: PropTypes.func,
};

GameCodeForm.defaultProps = {
  roomCode: '',
  sendCodeToAll: ()=>{},
  setRoomCode: ()=>{},
};
export default GameCodeForm;
