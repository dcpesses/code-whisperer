import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chatters: {}, // user info for chatters
  info: {},
  moderatedChannels: [],
  whisperStatus: {},
};


export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserInfo: (state) => {
      state.info = {};
    },
    setFakeStates: (state, action) => {
      if (action.payload.chatters) {
        state.chatters = action.payload.chatters;
      }
      if (action.payload.whisperStatus) {
        state.whisperStatus = action.payload.whisperStatus;
      }
    },
    setModeratedChannels: (state, action) => {
      if (action.payload) {
        state.moderatedChannels = action.payload;
      }
    },
    setChatterInfo: (state, action) => {
      if (action.payload.login) {
        state.chatters[action.payload.login] = action.payload;
      }
    },
    setUserInfo: (state, action) => {
      if (action.payload.login) {
        state.info = action.payload;
      }
    },
    setWhisperStatus: (state, action) => {
      if (action.payload.login) {
        state.whisperStatus[action.payload.login] = action.payload;
      }
    },
    removeModeratedChannels: (state) => {
      state.moderatedChannels = [];
    },
    removeChatterInfo: (state, action) => {
      if (action.payload) {
        delete state.chatters[action.payload];
      }
    },
    removeWhisperStatus: (state, action) => {
      if (action.payload) {
        delete state.whisperStatus[action.payload];
      }
    },
  },
});

export const { clearUserInfo, setChatterInfo, setFakeStates, setModeratedChannels, setUserInfo, setWhisperStatus, removeChatterInfo, removeModeratedChannels, removeWhisperStatus } = userSlice.actions;

export default userSlice.reducer;
