/* eslint-env jest */
import userReducer, {
  // setFakeStates,
  clearChannelInfo,
  clearModerators,
  clearVIPs,
  setChannelInfo,
  setModerators,
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
  moderators: [{
  }],
  vips:[{
  }],
};

describe('channel reducer', () => {
  const initialState = {
    user: {},
    moderators: [],
    vips: []
  };
  it('should handle initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual({
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
});
