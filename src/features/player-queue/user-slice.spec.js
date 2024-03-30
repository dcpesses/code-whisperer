/* eslint-env jest */
import userReducer, {
  setFakeStates,
  setModeratedChannels,
  setChatterInfo,
  setWhisperStatus,
  removeModeratedChannels,
  removeChatterInfo,
  removeWhisperStatus
} from './user-slice';

const userState = {
  chatters: {
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
  moderatedChannels: [{
    broadcaster_id: '1',
    broadcaster_login: 'TwitchStreamer',
    broadcaster_name: 'twitchstreamer',
  }],
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
    chatters: {},
    moderatedChannels: [],
    whisperStatus: {}
  };
  it('should handle initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual({
      chatters: {},
      moderatedChannels: [],
      whisperStatus: {}
    });
  });

  it('should set the fake states', () => {
    const actual = userReducer(initialState, setFakeStates(userState));
    expect(actual.chatters).toEqual(userState.chatters);
    expect(actual.whisperStatus).toEqual(userState.whisperStatus);
  });

  it('should set the user chatters for the given user', () => {
    const actual = userReducer(initialState, setChatterInfo(userState.chatters.twitchuser));
    expect(actual.chatters.twitchuser).toEqual(userState.chatters.twitchuser);
  });

  it('should set the whisper status for the given user', () => {
    const actual = userReducer(initialState, setWhisperStatus(userState.whisperStatus.twitchuser));
    expect(actual.whisperStatus.twitchuser).toEqual(userState.whisperStatus.twitchuser);
  });

  it('should remove the user chatters for the given user', () => {
    const actual = userReducer(userState, removeChatterInfo('twitchuser'));
    expect(actual.chatters).toEqual(initialState.chatters);
  });

  it('should remove the whisper status for the given user', () => {
    const actual = userReducer(userState, removeWhisperStatus('twitchuser'));
    expect(actual.whisperStatus).toEqual(initialState.whisperStatus);
  });

  it('should update the list of moderated channels by merging the payload data', () => {
    const actual = userReducer(initialState, setModeratedChannels(userState.moderatedChannels));
    expect(actual.moderatedChannels).toEqual(userState.moderatedChannels);
  });

  it('should update the list of moderated channels by clearing all data', () => {
    const actual = userReducer(initialState, removeModeratedChannels());
    expect(actual.moderatedChannels).toEqual(initialState.moderatedChannels);
  });
});
