/* eslint-env jest */
import userReducer, {
  clearChannelInfo,
  clearModerators,
  clearUserLookup,
  clearVIPs,
  setChannelInfo,
  setFakeChannelStates,
  setModerators,
  setUserLookup,
  setVIPs
} from './channel-slice';

const userState = {
  user: {
    id: '1',
    login: 'twitchstreamer',
    display_name: 'TwitchStreamer',
    type: '',
    broadcaster_type: '',
    description: 'description',
    profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
    offline_image_url: '',
    view_count: 0,
    created_at: '2019-11-18T00:47:34Z'
  },
  lookup: {
    dcpesses: {
      'badges': {
        'broadcaster': '1',
        'twitch-recap-2023': '1'
      },
      'badge-info': null,
      'badge-info-raw': null,
      'badges-raw': 'broadcaster/1,twitch-recap-2023/1',
      'client-nonce': 'nonce-of-ur-bidnez',
      'color': '#1E90FF',
      'display-name': 'dcpesses',
      'emotes': null,
      'emotes-raw': null,
      'first-msg': false,
      'flags': null,
      'id': '12345789-abde-4013-8567-9abcd0123566',
      'message-type': 'chat',
      'mod': false,
      'returning-chatter': false,
      'room-id': '0',
      'subscriber': false,
      'tmi-sent-ts': '1739040334117',
      'turbo': false,
      'user-id': '0',
      'user-type': null,
      'username': 'dcpesses',
    }
  },
  moderators: [{
  }],
  vips:[{
  }],
};

describe('channel reducer', () => {
  const initialState = {
    lookup: {},
    user: {},
    moderators: [],
    vips: []
  };
  it('should handle initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual({
      lookup: {},
      user: {},
      moderators: [],
      vips: []
    });
  });

  it('should set the user info for the broadcaster', () => {
    const actual = userReducer(initialState, setChannelInfo(userState.user));
    expect(actual.user).toEqual(userState.user);
  });

  it('should clear the user info for the broadcaster', () => {
    const actual = userReducer(userState, clearChannelInfo());
    expect(actual.user).toEqual(initialState.user);
  });

  it('should set the list of moderators for the broadcaster', () => {
    const actual = userReducer(initialState, setModerators(userState.moderators));
    expect(actual.moderators).toEqual(userState.moderators);
  });

  it('should clear the list of moderators for the broadcaster', () => {
    const actual = userReducer(userState, clearModerators());
    expect(actual.moderators).toEqual(initialState.moderators);
  });

  it('should set the list of VIPs for the broadcaster', () => {
    const actual = userReducer(initialState, setVIPs(userState.vips));
    expect(actual.vips).toEqual(userState.vips);
  });

  it('should clear the list of VIPs for the broadcaster', () => {
    const actual = userReducer(userState, clearVIPs());
    expect(actual.vips).toEqual(initialState.vips);
  });

  it('should set the data for the user lookup', () => {
    const actual = userReducer(initialState, setUserLookup(userState.lookup.dcpesses));
    expect(actual.lookup).toEqual(userState.lookup);
  });

  it('should clear the user lookup state', () => {
    const actual = userReducer(userState, clearUserLookup());
    expect(actual.lookup).toEqual(initialState.lookup);
  });

  it('should set the fake data for the channel states when available', () => {
    const actual = userReducer(initialState, setFakeChannelStates(userState));
    expect(actual).toEqual(userState);
  });
});
