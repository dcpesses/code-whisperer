/* eslint-env jest */
import settingsReducer, {
  clearAppSettings,
  setFakeSettingsStates,
  updateAppSettings
} from './settings-slice';

const settingsState = {
  app: {
    customDelimiter: ' | ',
    customJoinCommand: '!_join',
    customLeaveCommand: '!_leave',
    enableJoinConfirmationMessage: true,
    enableLeaveConfirmationMessage: true,
    enableModeratedChannelsOption: true,
    enableRoomCode: true,
    enableSubRequests: false,
  },
};

describe('settings reducer', () => {
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
    }
  };

  it('should handle initial state', () => {
    expect(settingsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should clear the app settings', () => {
    const actual = settingsReducer(settingsState, clearAppSettings());
    expect(actual.app).toEqual(initialState.app);
  });

  it('should set the fake states', () => {
    const actual = settingsReducer(initialState, setFakeSettingsStates(settingsState));
    expect(actual.app).toEqual(settingsState.app);
  });

  it('should update only the predefined app settings keys', () => {
    let app = Object.assign({}, settingsState.app, {
      enableNonPredefinedSetting: true
    });
    const actual = settingsReducer(initialState, updateAppSettings(app));
    expect(actual.app.enableNonPredefinedSetting).toBeUndefined();
    expect(actual.app).toEqual(settingsState.app);
  });

});
