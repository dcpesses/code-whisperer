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
    <div className="text-center">
      <input type="text" defaultValue={user.username} onChange={onInputChange} placeholder="Enter a Streamer" />
      <button onClick={onUpdateUsername}>
        Load
      </button>
      <div className="pt-2">
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
