import PropTypes from 'prop-types';

import './game-code-form.css';

function GameCodeForm({
  disabled = true,
  onInputChange = ()=>{},
  onSendToAll = ()=>{},
  value = '',
}) {

  const handleRoomCodeFocus = (evt) => evt.target.select();

  return (
    <div id="game-code-form" className="d-flex align-items-center p-3 my-3 text-white bg-purple rounded shadow-sm col-lg-8 col-xl-7 col-xxl-6 mx-auto">
      <div className="input-group">
        <input type="text" name="room-code" value={value || ''}
          autoComplete="false"
          aria-autocomplete="none"
          aria-describedby="btn-send-to-queue"
          aria-label="Enter Room Code"
          className="form-control enter-room-code"
          onChange={onInputChange}
          onFocus={handleRoomCodeFocus}
          placeholder="ENTER ROOM CODE"
          role="presentation"
          title="Paste Room Code Here"
        />
        <button type="button"
          className="btn btn-primary text-uppercase"
          id="btn-send-to-queue"
          onClick={onSendToAll}
          title="Send Code to All Players"
          disabled={disabled}
        >
          Send to Queue
        </button>
      </div>
    </div>
  );
}
GameCodeForm.propTypes = {
  disabled: PropTypes.bool,
  onInputChange: PropTypes.func,
  onSendToAll: PropTypes.func,
  value: PropTypes.string,
};

GameCodeForm.defaultProps = {
  disabled: true,
  onInputChange: ()=>{},
  onSendToAll: ()=>{},
  value: '',
};
export default GameCodeForm;
