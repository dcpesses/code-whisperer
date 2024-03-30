/* eslint-env jest */
import userReducer, {
  setFakeStates,
  setUserInfo,
  setWhisperStatus,
  removeUserInfo,
  removeWhisperStatus
} from './user-slice';

const userState = {
  info: {
    twitchuser: {
      id: '0',
      login: 'twitchuser',
      display_name: 'TwitchUser',
      type: '',
      broadcaster_type: '',
      description: 'description',
      profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
      offline_image_url: '',
      view_count: 0,
      created_at: '2019-11-18T00:47:34Z'
    }
  },
  whisperStatus: {
    twitchuser: {
      login: 'twitchuser',
      response: {
        msg: 'Code sent to @TwitchUser',
        status: 204
      }
    },
  }
};

describe('user reducer', () => {
  const initialState = {
    info: {},
    whisperStatus: {}
  };
  it('should handle initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual({
      info: {},
      whisperStatus: {}
    });
  });

  it('should set the fake states', () => {
    const actual = userReducer(initialState, setFakeStates(userState));
    expect(actual.info).toEqual(userState.info);
    expect(actual.whisperStatus).toEqual(userState.whisperStatus);
  });

  it('should set the user info for the given user', () => {
    const actual = userReducer(initialState, setUserInfo(userState.info.twitchuser));
    expect(actual.info.twitchuser).toEqual(userState.info.twitchuser);
  });

  it('should set the whisper status for the given user', () => {
    const actual = userReducer(initialState, setWhisperStatus(userState.whisperStatus.twitchuser));
    expect(actual.whisperStatus.twitchuser).toEqual(userState.whisperStatus.twitchuser);
  });

  it('should remove the user info for the given user', () => {
    const actual = userReducer(userState, removeUserInfo('twitchuser'));
    expect(actual.info).toEqual(initialState.info);
  });

  it('should remove the whisper status for the given user', () => {
    const actual = userReducer(userState, removeWhisperStatus('twitchuser'));
    expect(actual.whisperStatus).toEqual(initialState.whisperStatus);
  });
});
