import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {},
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
    clearVIPs: (state,) => {
      state.vips = [];
    },
    setChannelInfo: (state, action) => {
      if (action.payload.login) {
        state.user = action.payload;
      }
    },
    setModerators: (state, action) => {
      if (action.payload) {
        state.moderators = action.payload;
      }
    },
    setVIPs: (state, action) => {
      if (action.payload) {
        state.vips = action.payload;
      }
    },
  },
});

export const { clearChannelInfo, clearModerators, clearVIPs, setChannelInfo, setModerators, setVIPs } = userSlice.actions;

export default userSlice.reducer;
