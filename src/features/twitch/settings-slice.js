import { createSlice } from '@reduxjs/toolkit';

export const LOCALSETTINGS_KEY = '__settings';

const initialState = {
  app: {
    customDelimiter: null,
    customJoinCommand: null,
    customLeaveCommand: null,
    enableJoinConfirmationMessage: true,
    enableLeaveConfirmationMessage: true,
    enableModeratedChannelsOption: false,
    enableRoomCode: true,
    enableSubRequests: false,
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearAppSettings: (state) => {
      state.app = initialState.app;
    },
    setFakeSettingsStates: (state, action) => {
      if (action.payload.app) {
        state.app = action.payload.app;
      }
    },
    updateAppSettings: (state, action) => {
      if (action.payload) {
        Object.keys(action.payload).forEach(p => {
          if (state.app[p] !== undefined) {
            state.app[p] = action.payload[p];
          }
        });
      }
    },
  },
});

export const updateAppSettingsListener = (action, listenerApi) => {
  const {settings} = listenerApi.getState();
  const mergedSettings = Object.assign({}, settings.app, action.payload);
  localStorage.setItem(LOCALSETTINGS_KEY, JSON.stringify(mergedSettings));
};

export const { clearAppSettings, setFakeSettingsStates, updateAppSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
