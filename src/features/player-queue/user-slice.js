import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  info: {},
  whisperStatus: {}
};


export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFakeStates: (state, action) => {
      if (action.payload.info) {
        state.info = action.payload.info;
      }
      if (action.payload.whisperStatus) {
        state.whisperStatus = action.payload.whisperStatus;
      }
    },
    setUserInfo: (state, action) => {
      if (action.payload.login) {
        state.info[action.payload.login] = action.payload;
      }
    },
    setWhisperStatus: (state, action) => {
      if (action.payload.login) {
        state.whisperStatus[action.payload.login] = action.payload;
      }
    },
    removeUserInfo: (state, action) => {
      if (action.payload) {
        delete state.info[action.payload];
      }
    },
    removeWhisperStatus: (state, action) => {
      if (action.payload) {
        delete state.whisperStatus[action.payload];
      }
    },
  },
});

export const { setFakeStates, setUserInfo, setWhisperStatus, removeUserInfo, removeWhisperStatus } = userSlice.actions;

export default userSlice.reducer;
