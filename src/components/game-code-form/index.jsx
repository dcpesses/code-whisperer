import './game-code-form.css';

function GameCodeForm() {
  return (
    <div className="d-flex align-items-center p-3 my-3 text-white bg-purple rounded shadow-sm libre-franklin-font col-lg-8 col-xl-7 col-xxl-6">
      <div className="input-group">
        <input type="text" className="form-control libre-franklin-font" placeholder="ENTER CODE" aria-label="Enter Code" aria-describedby="btn-send-to-queue" />
        <button className="btn btn-primary libre-franklin-font text-uppercase" type="button" id="btn-send-to-queue">Send to Queue</button>
      </div>
    </div>
  );
}

export default GameCodeForm;
