import PropTypes from 'prop-types';
import { useState } from 'react';

export const noop = ()=>{};

function TestUserForm({user, updateUsername, onLogOut}) {
  const [text, setText] = useState([]);

  const onUpdateUsername = () => {
    updateUsername(text);
  };

  const onInputChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="p-3 my-3 text-white bg-body rounded shadow-sm libre-franklin-font col-lg-8 col-xl-7 col-xxl-6">
      <div className="text-center input-group">
        <input type="text" defaultValue={user.username} onChange={onInputChange} placeholder="Enter a Streamer" className="form-control libre-franklin-font bg-dark-subtle" aria-describedby="btn-load-user-info" />
        <button onClick={onUpdateUsername} className="btn btn-primary libre-franklin-font" type="button" id="btn-load-user-info">
          Load User Info
        </button>
      </div>

      <div className="pt-2 d-none">
        <button onClick={onLogOut} className="btn btn-primary">Log Out</button>
      </div>
    </div>
  );
}

TestUserForm.propTypes = {
  onLogOut: PropTypes.func,
  updateUsername: PropTypes.func,
  user: PropTypes.object,
};

TestUserForm.defaultProps = {
  onLogOut: noop,
  updateUsername: noop,
  user: {
    username: '',
  },
};
export default TestUserForm;
