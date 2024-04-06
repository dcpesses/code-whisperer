import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {},
  lookup: {}, // user "tags" metadata from messages
  moderators: [],
  vips: []
};

export const userSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    clearChannelInfo: (state) => {
      state.user = {};
    },
    clearModerators: (state) => {
      state.moderators = [];
    },
    clearUserLookup: (state) => {
      state.lookup = {};
    },
    clearVIPs: (state,) => {
      state.vips = [];
    },
    setChannelInfo: (state, action) => {
      if (action.payload.login) {
        state.user = action.payload;
      }
    },
    setFakeChannelStates: (state, action) => {
      if (action.payload.user) {state.user = action.payload.user;}
      if (action.payload.lookup) {state.lookup = action.payload.lookup;}
      if (action.payload.moderators) {state.moderators = action.payload.moderators;}
      if (action.payload.vips) {state.vips = action.payload.vips;}
    },
    setModerators: (state, action) => {
      if (action.payload) {
        state.moderators = action.payload;
      }
    },
    setUserLookup: (state, action) => {
      if (action.payload.username) {
        state.lookup[action.payload.username] = action.payload;
      }
    },
    setVIPs: (state, action) => {
      if (action.payload) {
        state.vips = action.payload;
      }
    },
  },
});

export const { clearChannelInfo, clearModerators, clearUserLookup, clearVIPs, setChannelInfo, setFakeChannelStates, setModerators, setUserLookup, setVIPs } = userSlice.actions;

export default userSlice.reducer;
