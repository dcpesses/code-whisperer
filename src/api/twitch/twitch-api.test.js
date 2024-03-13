/* eslint-env jest */
import {vi} from 'vitest';
import TwitchApi, { ActivityStatus, noop } from './index';
// import { describe, expect, test } from '@jest/globals';
// import TwitchApi, { ActivityStatus } from './index';
vi.mock('fetch');

describe('TwitchApi', () => {
  let twitchApi;

  beforeEach(() => {
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
    vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');
    twitchApi = new TwitchApi({
      clientId: 'mockClientId',
      clientSecret: 'mockClientSecret',
      redirectUri: 'mockRedirectUri',
      code: 'mockCode',
      accessToken: 'mockAccessToken',
      refreshToken: 'mockRefreshToken',
      onInit: vi.fn(),
      onMessage: vi.fn(),
      onTokenUpdate: vi.fn(),
      authError: vi.fn(),
      debug: true,
      init: false,
    });
  });

  afterEach(()=>{
    twitchApi = null;
    vi.unstubAllEnvs();
  });

  describe('constructor', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
      vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
      vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');
      vi.stubEnv('VITE_APP_REDIRECT_URI_NOENCODE', 'VITE_APP_REDIRECT_URI_NOENCODE');
      vi.spyOn(window.localStorage.__proto__, 'getItem')
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValue('mock-refresh-token');
    });
    afterEach(()=>{
      vi.unstubAllEnvs();
      twitchApi = null;
    });
    test('should initialize with passed parameters', () => {

      const mockCallback = vi.fn();
      const twitchApi = new TwitchApi({
        clientId: 'mockClientId',
        clientSecret: 'mockClientSecret',
        redirectUri: 'mockRedirectUri',
        code: 'mockCode',
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        onInit: mockCallback,
        onMessage: mockCallback,
        onTokenUpdate: mockCallback,
        authError: mockCallback,
        debug: true,
        init: false,
      });
      expect(twitchApi._clientId).toBe('mockClientId');
      expect(twitchApi._clientSecret).toBe('mockClientSecret');
      expect(twitchApi._redirectUri).toBe('mockRedirectUri');
      expect(twitchApi._code).toBe('mockCode');
      expect(twitchApi._accessToken).toBe('mockAccessToken');
      expect(twitchApi._refreshToken).toBe('mockRefreshToken');
      expect(twitchApi._onInitCallback).toBe(mockCallback);
      expect(twitchApi._onMessageCallback).toBe(mockCallback);
      expect(twitchApi._onTokenUpdateCallback).toBe(mockCallback);
      expect(twitchApi._authErrorCallback).toBe(mockCallback);
      expect(twitchApi.debug).toBe(true);
    });
    test('should initialize with default values', () => {
      const twitchApi = new TwitchApi({init: false});
      expect(twitchApi._clientId).toBe('VITE_APP_TWITCH_CLIENT_ID');
      expect(twitchApi._clientSecret).toBe('VITE_APP_TWITCH_CLIENT_SECRET');
      expect(twitchApi._redirectUri).toBe('VITE_APP_REDIRECT_URI_NOENCODE');
      expect(twitchApi._code).toBeNull();
      expect(twitchApi._accessToken).toBe('mock-access-token');
      expect(twitchApi._refreshToken).toBe('mock-refresh-token');
      expect(twitchApi._onInitCallback).toBe(noop);
      expect(twitchApi._onMessageCallback).toBe(noop);
      expect(twitchApi._onTokenUpdateCallback).toBe(noop);
      expect(twitchApi._authErrorCallback).toBe(noop);
    });
  });


  describe('clientId', () => {
    test('should set and get clientId properly', () => {
      twitchApi.clientId = 'mockClientId';
      expect(twitchApi.clientId).toBe('mockClientId');
    });
  });

  describe('clientSecret', () => {
    test('should set and get clientSecret properly', () => {
      twitchApi.clientSecret = 'mockClientSecret';
      expect(twitchApi.clientSecret).toBe('mockClientSecret');
    });
  });

  describe('redirectUri', () => {
    test('should set and get redirectUri properly', () => {
      twitchApi.redirectUri = 'mockRedirectUri';
      expect(twitchApi.redirectUri).toBe('mockRedirectUri');
    });
  });

  describe('code', () => {
    test('should set and get code properly', () => {
      twitchApi.code = 'mockCode';
      expect(twitchApi.code).toBe('mockCode');
    });
  });

  describe('accessToken', () => {
    test('should set and get accessToken properly', () => {
      twitchApi.accessToken = 'mockAccessToken';
      expect(twitchApi.accessToken).toBe('mockAccessToken');
    });
  });

  describe('refreshToken', () => {
    test('should set and get refreshToken properly', () => {
      twitchApi.refreshToken = 'mockRefreshToken';
      expect(twitchApi.refreshToken).toBe('mockRefreshToken');
    });
  });

  describe('onInit', () => {
    test('should set and get onInit callback properly', () => {
      const callback = vi.fn();
      twitchApi.onInit = callback;
      expect(twitchApi.onInit).toBe(callback);
    });
  });

  describe('onMessage', () => {
    test('should set and get onMessage callback properly', () => {
      const callback = vi.fn();
      twitchApi.onMessage = callback;
      expect(twitchApi.onMessage).toBe(callback);
    });
  });

  describe('onTokenUpdate', () => {
    test('should set and get onTokenUpdate callback properly', () => {
      const callback = vi.fn();
      twitchApi.onTokenUpdate = callback;
      expect(twitchApi.onTokenUpdate).toBe(callback);
    });
  });

  describe('authError', () => {
    test('should set and get authError callback properly', () => {
      const callback = vi.fn();
      twitchApi.authError = callback;
      expect(twitchApi.authError).toBe(callback);
    });
  });

  describe('userInfo', () => {
    test('should return userInfo properly', () => {
      expect(twitchApi.userInfo).toEqual({});
    });
  });

  describe('expires_in', () => {
    test('should return expires_in properly', () => {
      expect(twitchApi.expires_in).toBeNull();
    });
  });

  describe('expiry_time', () => {
    test('should return expiry_time properly', () => {
      expect(twitchApi.expiry_time).toBeNull();
    });
  });

  describe('isAuth', () => {
    test('should return isAuth properly', () => {
      expect(twitchApi.isAuth).toBe(false);
    });
  });

  describe('isInit', () => {
    test('should return isInit properly', () => {
      expect(twitchApi.isInit).toBe(false);
    });
  });

  describe('channel', () => {
    test('should return channel properly', () => {
      expect(twitchApi.channel).toBeNull();
    });
  });

  describe('lastMessageTimes', () => {
    test('should return lastMessageTimes properly', () => {
      expect(twitchApi.lastMessageTimes).toEqual({});
    });
  });

  // WIP
  describe.skip('async functions', () => {
    let twitchApi;
    beforeEach(() => {
      twitchApi = new TwitchApi({
        clientId: 'mockClientId',
        clientSecret: 'mockClientSecret',
        redirectUri: 'mockRedirectUri',
        code: 'mockCode',
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        onInit: vi.fn(),
        onMessage: vi.fn(),
        onTokenUpdate: vi.fn(),
        authError: vi.fn(),
        debug: true,
        init: false,
      });
    });
    test('init should return oauth, users, and valid data', async() => {
      const data = await twitchApi.init();
      expect(data).toEqual(expect.objectContaining({
        oauth: expect.anything(),
        users: expect.anything(),
        valid: expect.anything(),
      }));
    });

    test('resume should return oauth, users, and valid data', async() => {
      const data = await twitchApi.resume('mockAccessToken');
      expect(data).toEqual(expect.objectContaining({
        oauth: expect.anything(),
        users: expect.anything(),
        valid: expect.anything(),
      }));
    });

    test('requestAuthentication should return oauth data', async() => {
      const data = await twitchApi.requestAuthentication('mockCode');
      expect(data).toEqual(expect.objectContaining({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
        expires_in: expect.any(Number),
        scope: expect.any(String),
        token_type: expect.any(String),
      }));
    });
  });



  describe('getChatterStatus', () => {
    beforeEach(() => {
      // Mocking requestChatters response
      twitchApi.requestChatters = vi.fn(() => ({
        data: [
          { user_login: 'user1' },
          { user_login: 'user2' },
          { user_login: 'user3' },
        ],
      }));
    });

    test('should return ActivityStatus.ACTIVE for a user who sent a chat message in the last 10 minutes', async() => {
      twitchApi.updateLastMessageTime('user1');
      const status = await twitchApi.getChatterStatus('user1');
      expect(status).toBe(ActivityStatus.ACTIVE);
    });

    test('should return ActivityStatus.IDLE for a user who is present in chatters but has not sent a chat message in the last 10 minutes', async() => {
      const status = await twitchApi.getChatterStatus('user2');
      expect(status).toBe(ActivityStatus.IDLE);
    });

    test('should return ActivityStatus.DISCONNECTED for a user who is not present in chatters', async() => {
      const status = await twitchApi.getChatterStatus('nonexistent_user');
      expect(status).toBe(ActivityStatus.DISCONNECTED);
    });
  });

  describe('requestAuthentication', () => {
    test('should return authentication object on successful authentication', async() => {
      // Mocking fetch call
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ access_token: 'mockAccessToken' }),
        })
      );

      const authentication = await twitchApi.requestAuthentication('mockCode');

      expect(authentication).toEqual({ access_token: 'mockAccessToken' });
      expect(fetch).toHaveBeenCalledWith('https://id.twitch.tv/oauth2/token?grant_type=authorization_code&code=mockCode&redirect_uri=mockRedirectUri&client_id=mockClientId&client_secret=mockClientSecret', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
        },
      });
    });
  });

  // Add more tests for other methods/functions as needed
});



// import TwitchApi, { ActivityStatus } from './TwitchApi';
/*
describe('TwitchApi', () => {
  // Mocked parameters for constructor
  const mockConstructorParams = {
    clientId: 'mockClientId',
    clientSecret: 'mockClientSecret',
    redirectUri: 'mockRedirectUri',
    code: 'mockCode',
    accessToken: 'mockAccessToken',
    refreshToken: 'mockRefreshToken',
    onInit: vi.fn(),
    onMessage: vi.fn(),
    onTokenUpdate: vi.fn(),
    authError: vi.fn(),
    debug: true,
    init: true,
  };

  // Mocked options for testing
  const mockedOptions = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' },
    { value: 4, label: 'Option 4' },
  ];

  // Instantiate TwitchApi for testing
  let twitchApi;

  beforeEach(() => {
    twitchApi = new TwitchApi(mockConstructorParams);
  });

  // Mocked requestChatters response
  const mockedChattersResponse = {
    data: [
      { user_login: 'user1' },
      { user_login: 'user2' },
      { user_login: 'user3' },
    ],
  };

  // Mocked requestChatters function
  twitchApi.requestChatters = vi.fn().mockResolvedValue(mockedChattersResponse);

  test('should properly initialize with provided parameters', () => {
    expect(twitchApi.clientId).toBe(mockConstructorParams.clientId);
    expect(twitchApi.clientSecret).toBe(mockConstructorParams.clientSecret);
    expect(twitchApi.redirectUri).toBe(mockConstructorParams.redirectUri);
    expect(twitchApi.code).toBe(mockConstructorParams.code);
    expect(twitchApi.accessToken).toBe(mockConstructorParams.accessToken);
    expect(twitchApi.refreshToken).toBe(mockConstructorParams.refreshToken);
    expect(twitchApi.onInit).toBe(mockConstructorParams.onInit);
    expect(twitchApi.onMessage).toBe(mockConstructorParams.onMessage);
    expect(twitchApi.onTokenUpdate).toBe(mockConstructorParams.onTokenUpdate);
    expect(twitchApi.authError).toBe(mockConstructorParams.authError);
    expect(twitchApi.debug).toBe(mockConstructorParams.debug);
    expect(twitchApi.init).toBe(mockConstructorParams.init);
  });

  test('should return filtered options', () => {
    const filter = 'Option';
    const currentValues = [1, 3];
    const expectedOutput = [
      { value: 2, label: 'Option 2' },
      { value: 4, label: 'Option 4' },
    ];
    const result = twitchApi.filterOptions(mockedOptions, filter, currentValues);
    expect(result).toEqual(expectedOutput);
  });

  test('should return ActivityStatus.ACTIVE for a user who sent a chat message in the last 10 minutes', async() => {
    const user = 'user1';
    twitchApi.updateLastMessageTime(user);
    const status = await twitchApi.getChatterStatus(user);
    expect(status).toBe(ActivityStatus.ACTIVE);
  });

  test('should return ActivityStatus.IDLE for a user who is present in chatters but has not sent a chat message in the last 10 minutes', async() => {
    const user = 'user2';
    const status = await twitchApi.getChatterStatus(user);
    expect(status).toBe(ActivityStatus.IDLE);
  });

  test('should return ActivityStatus.DISCONNECTED for a user who is not present in chatters', async() => {
    const user = 'nonexistent_user';
    const status = await twitchApi.getChatterStatus(user);
    expect(status).toBe(ActivityStatus.DISCONNECTED);
  });
});
*/
