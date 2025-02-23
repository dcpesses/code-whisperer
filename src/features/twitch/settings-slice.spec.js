/* eslint-env jest */
import {vi} from 'vitest';
import settingsReducer, {
  clearAppSettings,
  setFakeSettingsStates,
  updateAppSettings,
  updateAppSettingsListener
} from './settings-slice';

const settingsState = {
  app: {
    customDelimiter: ' | ',
    customJoinCommand: '!_join',
    customLeaveCommand: '!_leave',
    customQueueCommand: '!_queue',
    enableJoinConfirmationMessage: true,
    enableLeaveConfirmationMessage: true,
    enableModeratedChannelsOption: true,
    enableRestrictedListQueue: false,
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
      customQueueCommand: null,
      enableJoinConfirmationMessage: true,
      enableLeaveConfirmationMessage: true,
      enableModeratedChannelsOption: false,
      enableRestrictedListQueue: true,
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

describe('updateAppSettingsListener', () => {
  test('should merge the app settings from the payload and save to localStorage', () => {
    vi.spyOn(window.localStorage, 'setItem');
    let action = {
      payload: {
        customDelimiter: ' / ',
        customJoinCommand: '!join',
      }
    };
    let listenerApi = {
      getState: vi.fn().mockReturnValue({
        settings: settingsState
      })
    };
    const nextSettings = {
      ...settingsState.app,
      customDelimiter: ' / ',
      customJoinCommand: '!join'
    };

    updateAppSettingsListener(action, listenerApi);

    expect(localStorage.setItem).toHaveBeenCalledWith('__settings', JSON.stringify(nextSettings));
  });
});
