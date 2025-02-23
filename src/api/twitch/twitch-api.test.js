/* eslint-env jest */
import {vi} from 'vitest';
import TwitchApi, { ActivityStatus, noop } from './index';

global.fetch = vi.fn();
vi.mock('tmi.js');

const getTwitchApiConfig = (overrides={}) => Object.assign({
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
  debug: false,
  init: false,
}, overrides);


describe('TwitchApi', () => {
  let twitchApi;

  beforeEach(() => {
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
    vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');
    twitchApi = new TwitchApi(getTwitchApiConfig());
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
      vi.spyOn(window.localStorage, 'getItem')
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
        debug: false,
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
    test('should call init', async() => {
      const twitchApi = await new TwitchApi({code: 'MOCK CODE', debug: false, init: true});
      expect(twitchApi.error).toBeDefined();
    });
  });

  describe('getters/setters', () => {

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

  });

  describe('init', () => {
    test('should call _init', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(window.location, 'hash', 'get').mockReturnValue('?code=MOCK_CODE&scope=chat%3Aread');
      vi.spyOn(twitchApi, '_init').mockResolvedValue('ok');
      const data = await twitchApi.init();
      expect(data).toEqual('ok');
      expect(global.console.log).toBeCalledTimes(2);
    });
  });

  describe('_init', () => {
    beforeEach(() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(window.localStorage, 'setItem');
      vi.spyOn(twitchApi, 'requestAuthentication').mockResolvedValue({status: 204});
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      vi.spyOn(twitchApi, 'requestUsers').mockResolvedValue({status: 204, data: [{login: 'username', id: 0}]});
      vi.spyOn(twitchApi, '_authErrorCallback').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, '_onInitCallback').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, 'setUserInfo').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, 'initChatClient').mockResolvedValue(void 0);
    });
    test('should return oauth, users, and valid data', async() => {
      vi.spyOn(window.location, 'hash', 'get').mockReturnValue('?code=MOCK_CODE&scope=chat%3Aread');
      const data = await twitchApi._init();
      expect(data).toEqual({
        oauth: { status: 204 },
        users: { status: 204, data: [{ id: 0, login: 'username' }] },
        valid: { status: 204, login: 'username' },
        instance: expect.any(TwitchApi),
      });
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should return error data from requestAuthentication', async() => {
      vi.spyOn(twitchApi, 'requestAuthentication').mockResolvedValue({status: 403, message: 'Forbidden'});
      const data = await twitchApi._init();
      expect(data).toEqual(expect.objectContaining({
        oauth: { status: 403, message: 'Forbidden' },
        users: null,
        valid: null,
        error: true,
        instance: expect.any(TwitchApi),
      }));
      expect(twitchApi._authErrorCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should return error data from validateToken', async() => {
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 403, message: 'Forbidden'});
      const data = await twitchApi._init();
      expect(data).toEqual(expect.objectContaining({
        oauth: { status: 204 },
        users: null,
        valid: { status: 403, message: 'Forbidden' },
        error: true,
        instance: expect.any(TwitchApi),
      }));
      expect(twitchApi._authErrorCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should return error data from requestUsers', async() => {
      vi.spyOn(twitchApi, 'requestUsers').mockResolvedValue({status: 403, message: 'Forbidden'});
      const data = await twitchApi._init();
      expect(data).toEqual(expect.objectContaining({
        oauth: { status: 204 },
        users: { status: 403, message: 'Forbidden' },
        valid: { status: 204, login: 'username' },
        error: true,
        instance: expect.any(TwitchApi),
      }));
      expect(twitchApi._authErrorCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should handle unexpected errors', async() => {
      vi.spyOn(twitchApi, 'requestAuthentication').mockRejectedValue('error');
      const data = await twitchApi._init();
      expect(data).toEqual({
        oauth: null,
        users: null,
        valid: null,
        error: 'error',
        instance: expect.any(TwitchApi),
      });
      expect(twitchApi._authErrorCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(1);
    });
  });

  describe('resume', () => {
    beforeEach(() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(window.localStorage, 'setItem');
      vi.spyOn(twitchApi, 'requestAuthentication').mockResolvedValue({status: 204});
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      vi.spyOn(twitchApi, 'requestUsers').mockResolvedValue({status: 204, data: [{login: 'username', id: 0}]});
      vi.spyOn(twitchApi, '_authErrorCallback').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, '_onInitCallback');
      vi.spyOn(twitchApi, 'setUserInfo').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, 'initChatClient').mockResolvedValue(void 0);
    });
    test('should return oauth, users, and valid data', async() => {
      const data = await twitchApi.resume();
      expect(data).toEqual({
        oauth: {},
        users: { status: 204, data: [{ id: 0, login: 'username' }] },
        valid: { status: 204, login: 'username' },
        instance: expect.any(TwitchApi),
      });
      expect(twitchApi._onInitCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(3);
    });
    test('should return console warning when accessToken is invalid', async() => {
      vi.spyOn(global.console, 'warn');
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 403, message: 'Forbidden'});
      twitchApi._accessToken = null;
      await twitchApi.resume();
      expect(twitchApi._authErrorCallback).toHaveBeenCalledTimes(0);
      expect(global.console.warn).toBeCalledTimes(1);
    });
    test('should return error data from validateToken', async() => {
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 403, message: 'Forbidden'});
      const data = await twitchApi.resume();
      expect(data).toEqual(expect.objectContaining({
        oauth: {},
        users: null,
        valid: { status: 403, message: 'Forbidden' },
        error: true,
        instance: expect.any(TwitchApi),
      }));
      expect(twitchApi._authErrorCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(2);
    });
    test('should return error data from requestUsers', async() => {
      vi.spyOn(twitchApi, 'requestUsers').mockResolvedValue({status: 403, message: 'Forbidden'});
      const data = await twitchApi.resume();
      expect(data).toEqual(expect.objectContaining({
        oauth: {},
        users: { status: 403, message: 'Forbidden' },
        valid: { status: 204, login: 'username' },
        error: true,
        instance: expect.any(TwitchApi),
      }));
      expect(twitchApi._authErrorCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(2);
    });
    test('should handle unexpected errors', async() => {
      vi.spyOn(twitchApi, 'validateToken').mockRejectedValue('error');
      const data = await twitchApi.resume();
      expect(data).toEqual({
        oauth: null,
        users: null,
        valid: null,
        error: 'error',
        instance: expect.any(TwitchApi),
      });
      expect(twitchApi._authErrorCallback).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(2);
    });
  });

  describe('initChatClient', () => {
    test('should successfully connect to chat client', () => {
      vi.spyOn(twitchApi, '_initChatClient');
      twitchApi.initChatClient();
      expect(twitchApi._initChatClient).toBeCalledTimes(1);
    });
  });

  describe('_initChatClient', () => {
    test('should successfully connect to chat client', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      const client = await twitchApi._initChatClient();
      expect(client).toBeDefined();
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should successfully disconnect chat client if it already exists', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      const disconnect = vi.fn();
      twitchApi._chatClient = { disconnect };
      const client = await twitchApi._initChatClient();
      expect(client).toBeDefined();
      expect(disconnect).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should handle errors when disconnecting chat client', async() => {
      vi.spyOn(global.console, 'warn');
      const disconnect = vi.fn().mockRejectedValue('error');
      twitchApi._chatClient = { disconnect };
      try {
        await twitchApi._initChatClient();
      } catch (e) {
        expect(e).toEqual('Login authentication failed');
      }

      expect(disconnect).toHaveBeenCalled();
      expect(global.console.warn).toBeCalledTimes(1);
    });
  });

  describe('onMessageCallback', () => {
    test('should successfully call function defined in _onMessageCallback', () => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      twitchApi._onMessageCallback = vi.fn();
      twitchApi.onMessageCallback(1, 2, 3, 4);
      expect(twitchApi._onMessageCallback).toBeCalledWith(1, 2, 3, 4);
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should handle calls when no function defined in _onMessageCallback', () => {
      vi.spyOn(global.console, 'warn');
      twitchApi._onMessageCallback = null;
      twitchApi.onMessageCallback(1, 2, 3, 4);
      expect(global.console.warn).toHaveBeenCalled();
    });
  });

  describe('closeChatClient', () => {
    test('should successfully disconnect chat client', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      const disconnect = vi.fn();
      twitchApi._chatClient = { disconnect };
      await twitchApi.closeChatClient();
      expect(disconnect).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(1);
    });
    test('should handle errors when disconnecting chat client', async() => {
      vi.spyOn(global.console, 'log');
      const disconnect = vi.fn().mockRejectedValue(null);
      twitchApi._chatClient = { disconnect };
      await twitchApi.closeChatClient();
      expect(disconnect).toHaveBeenCalled();
      expect(global.console.log).toBeCalledTimes(1);
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

  describe('setUserInfo', () => {
    test('should save user info to localStorage', () => {
      vi.spyOn(window.localStorage, 'setItem');
      twitchApi.setUserInfo({
        login: 'login',
        id: 'id',
        profile_image_url: 'url'
      });
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(5);
      expect(window.localStorage.setItem.mock.calls).toMatchSnapshot();
    });
  });


  describe('switchChannel', () => {
    test('should load user info for the specified channel and reinit the chat client', async() => {
      vi.spyOn(twitchApi, '_initChatClient').mockResolvedValue();
      vi.spyOn(twitchApi, 'setChannelInfo').mockImplementation();
      vi.spyOn(twitchApi, 'requestUserInfo').mockResolvedValue({
        data: [{
          id: '0',
          login: 'login',
          profile_image_url: 'url'
        }]
      });
      const response = await twitchApi.switchChannel('login');
      expect(twitchApi.requestUserInfo).toHaveBeenCalled();
      expect(response).toEqual({
        data: [{
          id: '0',
          login: 'login',
          profile_image_url: 'url'
        }]
      });
    });
  });

  describe('setChannelInfo', () => {
    test('should save channel info to localStorage', () => {
      vi.spyOn(window.localStorage, 'setItem');
      twitchApi.setChannelInfo({
        login: 'login',
        id: '1',
        profile_image_url: 'url'
      });
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(4);
      expect(window.localStorage.setItem.mock.calls).toMatchSnapshot();
    });
  });

  describe('requestAuthentication', () => {
    test('should return authentication object on successful authentication', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ access_token: 'mockAccessToken' }),
      });

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

  describe('setAuthentication', () => {
    test('should save oauth tokens and expiry time to localStorage', () => {
      vi.useFakeTimers();
      vi.spyOn(Date, 'now').mockReturnValue(1445470140000); // October 21, 2015 4:29:00 PM PST
      vi.spyOn(window.localStorage, 'setItem');
      twitchApi.setAuthentication({
        access_token: 'mock_access_token',
        expires_in: 14000,
        refresh_token: 'mock_refresh_token'
      });
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(4);
      expect(window.localStorage.setItem.mock.calls).toMatchSnapshot();
      expect(window.localStorage.setItem.mock.calls[2][1]).toBe(1445470154000);
      vi.useRealTimers();
    });
  });

  describe('requestUserInfo', () => {
    test('should return information about a single user', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ access_token: 'mockAccessToken' })
      });
      const props = {id: 12345678, login: 'username'};
      const response = await twitchApi.requestUserInfo(props);

      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/users?id=${props.id}&login=${props.login}`, {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual({ access_token: 'mockAccessToken' });
    });
  });

  describe('requestUserInfoBatch', () => {
    test('should return information about the specified users', async() => {
      const fetchResponse = {
        json: vi.fn().mockResolvedValue({ access_token: 'mockAccessToken' })
      };
      vi.spyOn(global, 'fetch').mockResolvedValue(fetchResponse);

      const props = {ids: [12345678, 23456789], logins: ['username', 'another_user']};
      const response = await twitchApi.requestUserInfoBatch(props);

      expect(fetch).toHaveBeenCalledWith('https://api.twitch.tv/helix/users?id=12345678&id=23456789&login=username&login=another_user', {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(fetchResponse.json).toHaveBeenCalled();
      expect(response).toEqual({ access_token: 'mockAccessToken' });
    });
    test('should return error information', async() => {
      const fetchResponse = {
        json: vi.fn().mockResolvedValue({ access_token: 'mockAccessToken' }),
        status: 500
      };
      vi.spyOn(global, 'fetch').mockRejectedValue(fetchResponse);

      const props = {ids: [12345678, 23456789], logins: ['username', 'another_user']};
      const response = await twitchApi.requestUserInfoBatch(props);

      expect(fetch).toHaveBeenCalledWith('https://api.twitch.tv/helix/users?id=12345678&id=23456789&login=username&login=another_user', {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(fetchResponse.json).not.toHaveBeenCalled();
      expect(response.status).toEqual(500);
    });
  });

  describe('requestUsers', () => {
    test('should return information about currently logged in user', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({ access_token: 'mockAccessToken' }),
      });
      const response = await twitchApi.requestUsers();

      expect(fetch).toHaveBeenCalledWith('https://api.twitch.tv/helix/users', {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual({ access_token: 'mockAccessToken' });
    });
  });

  describe('requestModeratedChannels', () => {
    test('should return a list of channels that the specified user has moderator privileges in', async() => {
      const mockModeratorResponse = {
        data: [
          { broadcaster_login: 'twitchstreamer1' },
          { broadcaster_login: 'twitchstreamer2' },
        ]
      };
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockModeratorResponse)
      });
      const userId = '123456789';
      const response = await twitchApi.requestModeratedChannels(userId);

      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/moderation/channels?user_id=${userId}`, {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual(mockModeratorResponse);
    });
  });

  describe('requestModerators', () => {
    test('should return information about users allowed to moderate chat for the broadcaster', async() => {
      const mockModeratorResponse = {
        data: [
          { user_login: 'moduser1' },
          { user_login: 'moduser2' },
        ]
      };
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockModeratorResponse)
      });
      const broadcasterId = 123456789;
      const response = await twitchApi.requestModerators(broadcasterId);

      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/moderation/moderators?first=100&after=&broadcaster_id=${broadcasterId}`, {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual(mockModeratorResponse);
    });
    test('should return information about users allowed to moderate chat for the broadcaster from a given cursor', async() => {
      const mockModeratorResponse = {
        data: [
          { user_login: 'moduser1' },
          { user_login: 'moduser2' },
        ]
      };
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockModeratorResponse)
      });
      const broadcasterId = 123456789;
      const cursor = 'eyJiIjpudWxsLCJhIjp7IkN1cnNvciI6IjEwMDQ3MzA2NDo4NjQwNjU3MToxSVZCVDFKMnY5M1BTOXh3d1E0dUdXMkJOMFcifX0';
      const response = await twitchApi.requestModerators(broadcasterId, cursor);

      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/moderation/moderators?first=100&after=${cursor}&broadcaster_id=${broadcasterId}`, {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual(mockModeratorResponse);
    });
  });


  describe('requestAllModerators', () => {
    test('should return information about users allowed to moderate chat for the broadcaster', async() => {
      vi.spyOn(twitchApi, 'requestModerators')
        .mockResolvedValueOnce({
          data: [
            { user_login: 'moduser1' },
            { user_login: 'moduser2' },
          ],
          pagination: {
            cursor: 'eyJiIjpudWxsLCJhIjp7'
          }
        })
        .mockResolvedValueOnce({
          data: [
            { user_login: 'moduser3' },
            { user_login: 'moduser4' },
          ],
          pagination: {}
        });
      const mockModeratorResponse = [
        { user_login: 'moduser1' },
        { user_login: 'moduser2' },
        { user_login: 'moduser3' },
        { user_login: 'moduser4' },
      ];
      const broadcasterId = 123456789;
      const response = await twitchApi.requestAllModerators(broadcasterId);

      expect(twitchApi.requestModerators).toHaveBeenCalled();
      expect(twitchApi.requestModerators).toHaveBeenCalledTimes(2);
      expect(twitchApi.requestModerators).toHaveBeenCalledWith(broadcasterId, '');
      expect(twitchApi.requestModerators).toHaveBeenCalledWith(broadcasterId, 'eyJiIjpudWxsLCJhIjp7');
      expect(response).toStrictEqual(mockModeratorResponse);
    });
    test('should return previous data if response data is empty', async() => {
      vi.spyOn(twitchApi, 'requestModerators')
        .mockResolvedValue({
          data: [],
          pagination: {}
        });
      const mockModeratorResponse = [
        { user_login: 'moduser1' },
        { user_login: 'moduser2' },
      ];
      const broadcasterId = 123456789;
      const response = await twitchApi.requestAllModerators(broadcasterId, '', mockModeratorResponse);

      expect(twitchApi.requestModerators).toHaveBeenCalledTimes(1);
      expect(twitchApi.requestModerators).toHaveBeenCalledWith(broadcasterId, '');
      expect(response).toStrictEqual(mockModeratorResponse);
    });
  });


  describe('requestVIPs', () => {
    test('should return a list of the VIPs of the broadcaster', async() => {
      const mockModeratorResponse = {
        data: [
          { user_login: 'vipuser1', user_id: '123' },
          { user_login: 'vipuser2', user_id: '456' },
          { user_login: 'vipuser3', user_id: '789' },
        ]
      };
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockModeratorResponse)
      });
      const broadcasterId = 123456789;
      const response = await twitchApi.requestVIPs(broadcasterId);

      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/channels/vips?first=100&broadcaster_id=${broadcasterId}`, {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual(mockModeratorResponse);
    });
    test('should return a filtered list of the VIPs of the broadcaster', async() => {
      const mockModeratorResponse = {
        data: [
          { user_login: 'vipuser1', user_id: '123' },
          { user_login: 'vipuser2', user_id: '456' },
        ]
      };
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve(mockModeratorResponse)
      });
      const broadcasterId = 123456789;
      const response = await twitchApi.requestVIPs(broadcasterId, ['123', '456']);

      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/channels/vips?first=100&broadcaster_id=${broadcasterId}&user_id=123&user_id=456`, {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual(mockModeratorResponse);
    });
  });

  describe('sendChatAnnouncement', () => {
    test('should send a chat announcement without error', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({status: 204})
      });
      const broadcasterId = '12345', moderatorId = '54321', message = 'Type !join to play!';
      await twitchApi.sendChatAnnouncement({message, broadcasterId, moderatorId});
      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`, {
        body: JSON.stringify({message: 'Type !join to play!'}),
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
          'Content-Type': 'application/json'
        },
        method: 'POST',
      });
    });
  });

  describe('sendWhisper', () => {
    let senderUserId;
    let recipientUser;

    beforeEach(() => {
      senderUserId = 123456789;
      recipientUser = {
        id: 987654321,
        username: 'user_name'
      };
      vi.spyOn(twitchApi, 'sendMessage');
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      twitchApi._userInfo = {id: senderUserId};
      twitchApi._chatClient = { say: vi.fn() };
    });

    afterEach(()=>{
      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/whispers?from_user_id=${senderUserId}&to_user_id=${recipientUser.id}`, {
        body: '{"message":"Howdy!"}',
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });
    });

    test('should send a message to the specified user', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        status: 204,
        json: () => Promise.resolve()
      });
      const response = await twitchApi.sendWhisper(recipientUser, 'Howdy!');
      expect(response.msg).toEqual(`Code sent to @${recipientUser.username}`);
      expect(twitchApi.sendMessage).toHaveBeenCalledWith(`/me ${response.msg}`);
    });

    test('should post an error message to chat using the returned message field', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(global, 'fetch').mockResolvedValue({
        status: 400,
        json: () => Promise.resolve({status: 400, error: 'Bad Request', message: 'A user cannot whisper themself'})
      });

      const response = await twitchApi.sendWhisper(recipientUser, 'Howdy!');
      expect(response.msg).toEqual(`Error 400 sending to @${recipientUser.username}: A user cannot whisper themself`);
      expect(twitchApi.sendMessage).toHaveBeenCalledWith(`/me ${response.msg}`);
      expect(global.console.log).toBeCalledTimes(4);
    });

    test('should post an error message to chatusing the returned error field', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(global, 'fetch').mockResolvedValue({
        status: 403,
        json: () => Promise.resolve({status: 403, error: 'Forbidden'})
      });

      const response = await twitchApi.sendWhisper(recipientUser, 'Howdy!');
      expect(response.msg).toEqual(`Error 403 sending to @${recipientUser.username}: Forbidden`);
      expect(twitchApi.sendMessage).toHaveBeenCalledWith(`/me ${response.msg}`);
      expect(global.console.log).toBeCalledTimes(4);
    });
    test('should catch an error and post an error message to chat', async() => {
      vi.spyOn(global.console, 'warn');
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(global, 'fetch').mockRejectedValue({
        status: 403,
        json: () => Promise.reject({status: 403, error: 'Forbidden'})
      });

      expect(async() => {
        const response = await twitchApi.sendWhisper(recipientUser, 'Howdy!');
        expect(response).toEqual(`Error sending to @${recipientUser.username}, please check console for details`);
        expect(twitchApi.sendMessage).toHaveBeenCalledWith(`/me ${response}`);
        expect(global.console.warn).toHaveBeenCalledTimes(1);
      }).rejects.toThrow();
      expect(global.console.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendMessage', () => {
    test('should send the passed message to the chat', () => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      const say = vi.fn();
      twitchApi._channel = 'user_name';
      twitchApi._chatClient = { say };
      twitchApi.sendMessage('Howdy!');
      expect(say).toHaveBeenCalledWith('user_name', 'Howdy!');
      expect(global.console.log).toBeCalledTimes(1);
    });
  });

  describe('resetLocalStorageItems', () => {
    test('should remove saved items from localStorage', () => {
      vi.spyOn(window.localStorage, 'removeItem');
      twitchApi.resetLocalStorageItems();
      expect(window.localStorage.removeItem).toHaveBeenCalledTimes(10);
    });
  });

  describe('resetState', () => {
    test('should restore class variables to original values', () => {
      Object.assign(twitchApi, {
        _username: '_username',
        _user_id: '_user_id',
        _profile_image_url: '_profile_image_url',
        _accessToken: '_accessToken',
        _expires_in: '_expires_in',
        _expiry_time: '_expiry_time',
        _refreshToken: '_refreshToken',
      });
      twitchApi.resetState();
      expect(twitchApi._username).not.toBeDefined();
      expect(twitchApi._user_id).not.toBeDefined();
      expect(twitchApi._profile_image_url).not.toBeDefined();
      expect(twitchApi._accessToken).not.toBeDefined();
      expect(twitchApi._expires_in).not.toBeDefined();
      expect(twitchApi._expiry_time).not.toBeDefined();
      expect(twitchApi._refreshToken).not.toBeDefined();
    });
  });

  describe('reset', () => {

    test('should call reset related functions', () => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(twitchApi, 'resetLocalStorageItems');
      vi.spyOn(twitchApi, 'resetState');
      twitchApi.reset();
      expect(twitchApi.resetLocalStorageItems).toHaveBeenCalled();
      expect(twitchApi.resetState).toHaveBeenCalled();
      expect(window.location.hash).toBe('');
      expect(global.console.log).toBeCalledTimes(1);
    });
  });

  describe('logOut', () => {
    test('should invalidate the active access token and reset the instance', async() => {
      vi.spyOn(twitchApi, 'reset');
      vi.spyOn(twitchApi, 'closeChatClient');
      vi.spyOn(global, 'fetch').mockResolvedValue({
        status: 200
      });
      await twitchApi.logOut();
      expect(global.fetch).toHaveBeenCalledWith('https://id.twitch.tv/oauth2/revoke?client_id=mockClientId&token=mockAccessToken&redirect_uri=mockRedirectUri', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json'
        }
      });
      expect(twitchApi.reset).toHaveBeenCalled();
    });
  });


  describe('requestRefreshToken', () => {
    test('should return a new auth token', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({status: 204})
      });
      vi.spyOn(twitchApi, 'setAuthentication');
      const params = {
        grant_type: 'refresh_token',
        client_id: twitchApi._clientId,
        client_secret: twitchApi._clientSecret,
        refresh_token: 'MOCK-REFRESH-TOKEN'
      };
      const requestParams = new URLSearchParams(params);
      await twitchApi.requestRefreshToken('MOCK-REFRESH-TOKEN');
      expect(fetch).toHaveBeenCalledWith(`https://id.twitch.tv/oauth2/token?${requestParams}`, {
        headers: {
          Authorization: `OAuth ${params.refresh_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      });
      expect(twitchApi.setAuthentication).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    const responseData = {
      'client_id': 'wbmytr93xzw8zbg0p1izqyzzc5mbiz',
      'login': 'twitchdev',
      'scopes': [
        'channel:read:subscriptions'
      ],
      'user_id': '141981764',
      'expires_in': 5520838
    };
    beforeEach(() => {
      twitchApi = new TwitchApi(getTwitchApiConfig());
    });
    test('should return a valid token response', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({
          data: responseData,
          status: 204,
        })
      });
      const token = twitchApi._accessToken;
      const response = await twitchApi.validateToken();
      expect(global.fetch).toHaveBeenCalledWith('https://id.twitch.tv/oauth2/validate', {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`
        }
      });
      expect(response.data).toBe(responseData);
    });
    test('should refresh the user token and return a requestRefreshToken response', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(twitchApi, 'requestRefreshToken').mockResolvedValue('refreshToken');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({
          message: 'invalid access token',
          status: 401,
        })
      }).mockResolvedValue({
        json: () => Promise.resolve({
          data: responseData,
          status: 204,
        })
      });
      const token = twitchApi._accessToken;
      const response = await twitchApi.validateToken(token);
      expect(global.fetch).toHaveBeenCalledWith('https://id.twitch.tv/oauth2/validate', {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`
        }
      });
      expect(response).toBe('refreshToken');
      expect(global.console.log).toBeCalledTimes(2);
      expect(twitchApi.requestRefreshToken).toHaveBeenCalledTimes(1);
    });
    test('should refresh the user token and return a requestRefreshToken response on caught 401 status error', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(twitchApi, 'requestRefreshToken').mockResolvedValue('refreshToken');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.reject({
          message: 'invalid access token',
          status: 401,
        })
      });
      const token = twitchApi._accessToken;
      const response = await twitchApi.validateToken(token);
      expect(global.fetch).toHaveBeenCalledWith('https://id.twitch.tv/oauth2/validate', {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`
        }
      });
      expect(response).toBe('refreshToken');
      expect(global.console.log).toBeCalledTimes(2);
      expect(twitchApi.requestRefreshToken).toHaveBeenCalledTimes(1);
    });
    test('should return without refreshing the user token on a non-401 status error', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(twitchApi, 'requestRefreshToken').mockResolvedValue('refreshToken');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.reject({
          message: 'invalid access token',
          status: 403,
        })
      });
      const token = twitchApi._accessToken;
      const response = await twitchApi.validateToken(token);
      expect(global.fetch).toHaveBeenCalledWith('https://id.twitch.tv/oauth2/validate', {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`
        }
      });
      expect(response).toBeUndefined();
      expect(global.console.log).toBeCalledTimes(1);
      expect(twitchApi.requestRefreshToken).toHaveBeenCalledTimes(0);
    });
  });

  describe('refetch', () => {
    const fetchArgs = [
      'https://api.twitch.tv/helix/users?twitchdev',
      {
        headers: {
          Authorization: 'Bearer MOCK_ACCESS_TOKEN',
          'Client-ID': 'MOCK_CLIENT_ID',
        },
      }
    ];
    const responseData = [
      {
        'broadcaster_type': 'partner',
        'created_at': '2021-07-30T20:32:28Z',
        'description': 'Supporting third-party developers building Twitch integrations from chatbots to game integrations.',
        'display_name': 'TwitchDev',
        'id': '141981764',
        'login': 'twitchdev',
        'offline_image_url': 'https://static-cdn.jtvnw.net/jtv_user_pictures/3f13ab61-ec78-4fe6-8481-8682cb3b0ac2-channel_offline_image-1920x1080.png',
        'profile_image_url': 'https://static-cdn.jtvnw.net/jtv_user_pictures/8a6381c7-d0c0-4576-b179-38bd5ce1d6af-profile_image-300x300.png',
        'type': '',
        'view_count': 6652509
      }
    ];

    beforeEach(() => {
      vi.spyOn(window.localStorage, 'getItem');
      twitchApi = new TwitchApi(getTwitchApiConfig());
    });

    test('should proxy a valid fetch call and return its response', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({
          data: responseData,
          status: 204,
        })
      });
      const response = await twitchApi.refetch(...fetchArgs);
      expect(global.fetch).toHaveBeenCalledWith(...fetchArgs);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch.mock.calls).toMatchSnapshot();
      const responseJson = await response.json();
      expect(responseJson.data).toBe(responseData);
    });

    test('should retry fetch call when the first attempt fails and return its response', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      vi.spyOn(global, 'fetch').mockRejectedValueOnce({
        json: () => Promise.resolve({
          status: 500,
        })
      }).mockResolvedValue({
        json: () => Promise.resolve({
          data: responseData,
          status: 204,
        })
      });
      const response = await twitchApi.refetch(...fetchArgs);
      expect(global.fetch).toHaveBeenCalledWith(...fetchArgs);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch.mock.calls).toMatchSnapshot();
      const responseJson = await response.json();
      expect(responseJson.data).toBe(responseData);
      expect(global.console.log).toBeCalledTimes(3);
    });

    test('should throw the original error if another error is thrown', async() => {
      vi.spyOn(global.console, 'log');
      twitchApi.debug = true;
      vi.spyOn(twitchApi, 'validateToken').mockRejectedValue({status: 504, login: 'username'});
      vi.spyOn(global, 'fetch').mockRejectedValueOnce({
        json: () => Promise.resolve({
          status: 500,
          error: 'first error'
        })
      }).mockRejectedValueOnce({
        json: () => Promise.resolve({
          status: 504,
          error: 'second error'
        })
      });

      let response;
      try {
        response = await twitchApi.refetch(...fetchArgs);
      } catch (e) {
        expect(e.json()).resolves.toEqual({status: 500, error: 'first error'});
        expect(global.fetch).toHaveBeenCalledWith(...fetchArgs);
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(response).toBeUndefined();
      }
      expect(global.console.log).toBeCalledTimes(2);
    });
  });

  describe('requestChatters', () => {
    test('should return users in chat for the broadcaster', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({
          data: [
            { user_login: 'user1' },
            { user_login: 'user2' },
          ],
          status: 204,
        })
      });
      twitchApi._userInfo = {
        id: 123456789,
      };
      const response = await twitchApi.requestChatters();
      expect(global.fetch).toHaveBeenCalledWith('https://api.twitch.tv/helix/chat/chatters?broadcaster_id=123456789&moderator_id=123456789&first=500', {
        headers: {
          Authorization: `Bearer ${twitchApi._accessToken}`,
          'Client-ID': twitchApi._clientId,
        }
      });
      expect(global.fetch.mock.calls).toMatchSnapshot();
      expect(response.data.length).toBe(2);
    });
  });

  describe('getChatterStatus', () => {
    let twitchApi;
    const mockChattersResponse = {
      data: [
        { user_login: 'user1' },
        { user_login: 'user2' },
        { user_login: 'user3' },
      ],
    };
    beforeEach(() => {
      twitchApi = new TwitchApi(getTwitchApiConfig());
      twitchApi.requestChatters = vi.fn().mockResolvedValue(mockChattersResponse);
    });

    test('should return ActivityStatus.ACTIVE for the broadcaster', async() => {
      twitchApi._channel = 'user0';
      const status = await twitchApi.getChatterStatus('user0');
      expect(status).toBe(ActivityStatus.ACTIVE);
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
      const status = await twitchApi.getChatterStatus('nobody');
      expect(status).toBe(ActivityStatus.DISCONNECTED);
    });

    test('should return ActivityStatus.DISCONNECTED when no chatters are returned', async() => {
      twitchApi.requestChatters = vi.fn().mockResolvedValue({data: []});
      const status = await twitchApi.getChatterStatus('user');
      expect(status).toBe(ActivityStatus.DISCONNECTED);
    });
  });
});
