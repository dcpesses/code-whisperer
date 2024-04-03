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
    clearQueue: (state) => {
      state.interested = [];
      state.joined = [];
      state.playing = [];
    },

    clearRoomCode: (state) => {
      state.roomCode = null;
    },

    closeQueue: (state) => {
      state.isQueueOpen = false;
    },

    incrementRandomCount: (state) => {
      state.randCount += 1;
    },

    openQueue: (state) => {
      state.isQueueOpen = true;
    },

    removeUser: (state, action) => {
      const username = action.payload;
      state.interested = state.interested.filter((iObj) => iObj.username !== username);
      state.playing = state.playing.filter((pObj) => pObj.username !== username);
    },

    resetRandomCount: (state) => {
      state.randCount = 0;
    },

    setFakeQueueStates: (state, action) => {
      if (action.payload.interested) {state.interested = action.payload.interested;}
      if (action.payload.isQueueOpen !== undefined) {state.isQueueOpen = action.payload.isQueueOpen;}
      if (action.payload.joined) {state.joined = action.payload.joined;}
      if (action.payload.maxPlayers) {state.maxPlayers = action.payload.maxPlayers;}
      if (action.payload.playing) {state.playing = action.payload.playing;}
      if (!isNaN(action.payload.randCount)) {state.randCount = action.payload.randCount;}
      if (action.payload.roomCode !== undefined) {state.roomCode = action.payload.roomCode;}
      if (action.payload.signupMessage !== undefined) {state.signupMessage = action.payload.signupMessage;}
      if (action.payload.streamerSeat !== undefined) {state.streamerSeat = action.payload.streamerSeat;}
    },

    setMaxPlayers: (state, action) => {
      if (action.payload) {
        state.maxPlayers = action.payload;
      }
    },

    setRoomCode: (state, action) => {
      if (action.payload) {
        state.roomCode = action.payload;
      }
    },

    toggleStreamerSeat: (state) => {
      state.streamerSeat = !state.streamerSeat;
    },

    updateColumnForUser: (state, action) => {
      const {user, column} = action.payload;
      if (state[column]) {
        state.interested = state.interested.filter((iObj) => iObj.username !== user.username);
        state.playing = state.playing.filter((pObj) => pObj.username !== user.username);
        state[column] = [...state[column], user];
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
  setFakeQueueStates,
  setMaxPlayers,
  setRoomCode,
  toggleStreamerSeat,
  updateColumnForUser,
} = queueSlice.actions;

export default queueSlice.reducer;
