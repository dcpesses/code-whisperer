import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  interested: [],
  playing: [],
  joined: [],
  maxPlayers: 8,
  roomCode: null,
  streamerSeat: false,
  isQueueOpen: true,
  randCount: 0,
  signupMessage: null
};


export const queueSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFakeStates: (state, action) => {
      if (action.payload.interested) {state.interested = action.payload.interested;}
      if (action.payload.playing) {state.playing = action.payload.playing;}
      if (action.payload.joined) {state.joined = action.payload.joined;}
      if (action.payload.maxPlayers) {state.maxPlayers = action.payload.maxPlayers;}
      if (action.payload.roomCode) {state.roomCode = action.payload.roomCode;}
      if (action.payload.streamerSeat) {state.streamerSeat = action.payload.streamerSeat;}
      if (action.payload.isQueueOpen) {state.isQueueOpen = action.payload.isQueueOpen;}
      if (action.payload.randCount) {state.randCount = action.payload.randCount;}
    },

    setRoomCode: (state, action) => {
      if (action.payload) {
        state.roomCode = action.payload;
      }
    },

    updateColumnForUser: (state, action) => {
      const {userObj, newColumn} = action.payload;
      if (state[newColumn]) {
        this.removeUser(userObj.username);
        state.interested = state.interested.filter((iObj) => iObj.username !== userObj.username);
        state.playing = state.playing.filter((pObj) => pObj.username !== userObj.username);
        state[newColumn] = [...state[newColumn], userObj];
      }
    },

    removeUser: (state, action) => {
      const username = action.payload;
      state.interested = state.interested.filter((iObj) => iObj.username !== username);
      state.playing = state.playing.filter((pObj) => pObj.username !== username);
    },

    clearQueue: (state) => {
      state.interested = [];
      state.joined = [];
      state.playing = [];
    },

    openQueue: (state) => {
      state.isQueueOpen = true;
    },

    closeQueue: (state) => {
      state.isQueueOpen = false;
    },

    toggleStreamerSeat: (state) => {
      state.streamerSeat = !state.streamerSeat;
    },

    clearRoomCode: (state) => {
      state.roomCode = null;
    },

    incrementRandomCount: (state) => {
      state.randCount += 1;
    },

    resetRandomCount: (state) => {
      state.randCount = 0;
    },

    setMaxPlayers: (state, action) => {
      if (action.payload) {
        state.maxPlayers = action.payload;
      }
    },
  },
});

export const {
  clearQueue,
  clearRoomCode,
  closeQueue,
  incrementRandomCount,
  openQueue,
  removeUser,
  resetRandomCount,
  setFakeStates,
  setMaxPlayers,
  setRoomCode,
  toggleStreamerSeat,
  updateColumnForUser,
} = queueSlice.actions;

export default queueSlice.reducer;
