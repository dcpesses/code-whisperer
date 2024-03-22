import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  info: {},
  whisperStatus: {}
};


export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
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
        state.info[action.payload] = null;
      }
    },
    removeWhisperStatus: (state, action) => {
      if (action.payload) {
        state.whisperStatus[action.payload] = null;
      }
    },
  },
});

export const selectUser = (state) => state.users.info;

export const { setUserInfo, setWhisperStatus, removeUserInfo, removeWhisperStatus } = userSlice.actions;

export default userSlice.reducer;
