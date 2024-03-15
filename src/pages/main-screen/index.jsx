import {useState} from 'react';
import PropTypes from 'prop-types';
import Header from '@/components/header';
import GameCodeForm from '@/components/game-code-form';
import GameQueue from '@/components/game-queue';
import TestUserForm from '@/components/test-user-form';

import './main-screen.css';

export const noop = ()=>{};

function MainScreen({
  accessToken, onLogOut, profile_image_url, toggleDeprecatedView, user_id, username, updateUsername
}) {

  let [roomCode, setRoomCode] = useState('');

  return (
    <div className="main-screen">
      <Header
        accessToken={accessToken}
        toggleDeprecatedView={toggleDeprecatedView}
        onLogOut={onLogOut}
        profile_image_url={profile_image_url}
        user_id={user_id}
        username={username}
      />

      <div id="content" className="container mx-auto">

        <GameCodeForm
          roomCode={roomCode}
          sendCodeToAll={window.console.log}
          setRoomCode={setRoomCode}
        />

        <div className="queues d-flex flex-column flex-md-row my-2">
          <GameQueue label="play queue" />
          <GameQueue label="interested" />
        </div>

        <TestUserForm
          user={{username}}
          updateUsername={updateUsername}
          onLogOut={onLogOut}
        />

      </div>
    </div>

  );
}

MainScreen.propTypes = {
  accessToken: PropTypes.any,
  onLogOut: PropTypes.func,
  profile_image_url: PropTypes.any,
  toggleDeprecatedView: PropTypes.func,
  updateUsername: PropTypes.func,
  user_id: PropTypes.any,
  username: PropTypes.any,
};

MainScreen.defaultProps = {
  accessToken: '',
  onLogOut: noop,
  profile_image_url: '',
  toggleDeprecatedView: noop,
  updateUsername: noop,
  user_id: '',
  username: '',
};
export default MainScreen;
