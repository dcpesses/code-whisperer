/* eslint-env jest */

import queueReducer, {
  clearQueue,
  clearRoomCode,
  closeQueue,
  incrementRandomCount,
  openQueue,
  removeUser,
  resetRandomCount,
  setFakeQueueStates,
  setMaxPlayers,
  setRoomCode,
  toggleStreamerSeat,
  updateColumnForUser,
} from './queue-slice';

const queueState = {
  interested: [{
    username: 'player2'
  }],
  playing: [{
    username: 'player1',
    isPrioritySeat: true
  }, {
    username: 'player3'
  }],
  joined: [{}],
  maxPlayers: 6,
  roomCode: 'MSLA',
  streamerSeat: true,
  isQueueOpen: false,
  randCount: 1,
  signupMessage: 'Type !join to sign-up for the next game!',
};

describe('channel reducer', () => {
  const initialState = {
    interested: [],
    isQueueOpen: true,
    joined: [],
    maxPlayers: 8,
    playing: [],
    randCount: 0,
    roomCode: null,
    signupMessage: null,
    streamerSeat: false,
  };

  it('should handle initial state', () => {
    expect(queueReducer(undefined, { type: 'unknown' })).toEqual({
      interested: [],
      isQueueOpen: true,
      joined: [],
      maxPlayers: 8,
      playing: [],
      randCount: 0,
      roomCode: null,
      signupMessage: null,
      streamerSeat: false,
    });
  });


  // clearQueue,
  it('should clear all of the queues', () => {
    const actual = queueReducer(queueState, clearQueue());
    expect(actual.interested).toEqual(initialState.interested);
    expect(actual.joined).toEqual(initialState.joined);
    expect(actual.playing).toEqual(initialState.playing);
  });

  // clearRoomCode,
  it('should clear the room code', () => {
    const actual = queueReducer(queueState, clearRoomCode());
    expect(actual.roomCode).toEqual(initialState.roomCode);
  });

  // closeQueue,
  it('should close the sign-up queue', () => {
    const actual = queueReducer(initialState, closeQueue());
    expect(actual.isQueueOpen).not.toEqual(initialState.isQueueOpen);
  });

  // incrementRandomCount,
  it('should increase the value of randCount', () => {
    const actual = queueReducer(initialState, incrementRandomCount());
    expect(actual.randCount).toEqual(1);
  });

  // openQueue,
  it('should open the sign-up queue', () => {
    const actual = queueReducer(queueState, openQueue());
    expect(actual.isQueueOpen).not.toEqual(queueState.isQueueOpen);
  });

  // removeUser,
  it('should remove the user from the queues', () => {
    const actual = queueReducer(queueState, removeUser('player2'));
    expect(actual.interested).toEqual([]);
    expect(actual.playing).toEqual(queueState.playing);
  });

  // setFakeQueueStates,
  it('should set the fake states', () => {
    const actual = queueReducer(initialState, setFakeQueueStates(queueState));
    expect(actual.interested).toEqual(queueState.interested);
    expect(actual.isQueueOpen).toEqual(queueState.isQueueOpen);
    expect(actual.joined).toEqual(queueState.joined);
    expect(actual.maxPlayers).toEqual(queueState.maxPlayers);
    expect(actual.playing).toEqual(queueState.playing);
    expect(actual.randCount).toEqual(queueState.randCount);
    expect(actual.roomCode).toEqual(queueState.roomCode);
    expect(actual.signupMessage).toEqual(queueState.signupMessage);
    expect(actual.streamerSeat).toEqual(queueState.streamerSeat);
  });

  // resetRandomCount,
  it('should reset the value of randCount to 0', () => {
    const actual = queueReducer(queueState, resetRandomCount());
    expect(actual.randCount).toEqual(0);
  });

  // setMaxPlayers,
  it('should update the value of maxPlayers', () => {
    const actual = queueReducer(initialState, setMaxPlayers(6));
    expect(actual.maxPlayers).toEqual(6);
  });

  // setRoomCode,
  it('should update the roomCode', () => {
    const actual = queueReducer(initialState, setRoomCode('YANK'));
    expect(actual.roomCode).toEqual('YANK');
  });
  it('should update the roomCode for an empty string', () => {
    const actual = queueReducer(initialState, setRoomCode(''));
    expect(actual.roomCode).toEqual('');
  });

  // toggleStreamerSeat,
  it('should toggle the value of streamerSeat', () => {
    const actual = queueReducer(initialState, toggleStreamerSeat());
    expect(actual.streamerSeat).not.toBe(initialState.streamerSeat);
  });

  // updateColumnForUser,
  it('should add the user to the Interested queue', () => {
    const actual = queueReducer(initialState, updateColumnForUser({user:'player1', column: 'interested'}));
    expect(actual.interested).not.toEqual(initialState.interested);
  });
  it('should add the user to the Playing queue', () => {
    const actual = queueReducer(initialState, updateColumnForUser({user:'player1', column: 'playing'}));
    expect(actual.playing).not.toEqual(initialState.playing);
  });
});
