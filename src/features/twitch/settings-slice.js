import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  app: {
    customDelimiter: null,
    customJoinCommand: null,
    customLeaveCommand: null,
    enableJoinConfirmationMessage: true,
    enableLeaveConfirmationMessage: true,
    enableModeratedChannelsOption: true,
    enableRoomCode: true,
    enableSubRequests: false,
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearAppSettings: (state) => {
      state.app = {};
    },
    setFakeSettingsStates: (state, action) => {
      if (action.payload.app) {state.user = action.payload.app;}
    },
    updateAppSettings: (state, action) => {
      state.setCount += 1;
      if (action.payload) {
        Object.keys(action.payload).forEach(p => {
          if (state.app[p] !== undefined) {
            state.app[p] = action.payload[p];
          }
        });
        // state.app = Object.assign({}, state.app, action.payload);
        // state = action.payload;
      } else {
        window.console.log('updateAppSettings', {action});
      }
    },
  },
});

export const { clearAppSettings, setFakeSettingsStates, updateAppSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
