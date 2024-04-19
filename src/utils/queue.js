
export const addUserToColumn = (props, user, column) => {
  if (!props || !props[column]) {
    return false;
  }

  props.updateColumnForUser({user, column});

  // TODO: can we lookup user info here

  return true;
};

export const handleNewPlayerRequest = (props, username, {isPrioritySeat=false}) => {

  if (isPrioritySeat) {
    // even if the queue is closed, still add them to the interested column for consideration
    const column = (props.isQueueOpen ? 'playing' : 'interested');

    return addUserToColumn(props, {username, isPrioritySeat}, column)
      ? 'you have been successfully added to the lobby.'
      : 'there was an error adding you to the lobby.';
  }

  if (isUserInLobby(props, username)) {
    return 'you are already in the lobby.';
  }

  if (!props.isQueueOpen) {
    return 'the queue is currently closed; users have already been selected for this game.';
  }
  return addUserToColumn(props, {username}, 'interested')
    ? 'you have successfully joined the lobby.'
    : 'there was an error adding you to the lobby.';
};

export const isUserInLobby = ({interested, playing}, username) => {
  return (
    interested.map(u => u.username)?.includes(username)
    || playing.map(u => u.username)?.includes(username)
  );
};

export const listInterestedQueue = ({interested}) => {
  return interested;
};

export const listPlayingQueue = ({playing, streamerSeat, twitchApi}) => {
  let queue = [];
  if (streamerSeat && twitchApi.channel) {
    queue.push({username: twitchApi.channel});
  }
  return queue.concat(playing).map(u => u.username);
};

export const playerCount = ({playing, streamerSeat}) => {
  return playing.length + (streamerSeat ? 1 : 0);
};

// routePlayRequest
export const routeJoinRequest = ({interested, playing, isQueueOpen, twitchApi, updateColumnForUser}, user, {sendConfirmationMsg = true, isPrioritySeat = false}) => {
  try {
    const msg = isQueueOpen
      ? handleNewPlayerRequest({interested, playing, isQueueOpen, twitchApi, updateColumnForUser}, user, {isPrioritySeat})
      : 'sign-ups are currently closed; try again after this game wraps up!';

    if (sendConfirmationMsg) {
      twitchApi?.sendMessage(`/me @${user}, ${msg}`);
    }
  } catch (e) {
    console.error('routeJoinRequest Error:', e);
  }
};

export const routeLeaveRequest = ({interested, playing, removeUser, twitchApi}, user, {sendConfirmationMsg = true}) => {
  const msg = isUserInLobby({interested, playing}, user)
    ? 'you have successfully left the lobby'
    : 'you were not in the lobby';

  removeUser(user);

  if (sendConfirmationMsg) {
    twitchApi?.sendMessage(`/me @${user}, ${msg}.`);
  }
};
