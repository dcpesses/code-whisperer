/* eslint-env jest */
import {vi} from 'vitest';
import TwitchApi, { ActivityStatus, noop } from './index';

global.fetch = vi.fn();
vi.mock('tmi');

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
      vi.spyOn(window.location, 'hash', 'get').mockReturnValue('?code=MOCK_CODE&scope=chat%3Aread');
      vi.spyOn(twitchApi, '_init').mockResolvedValue('ok');
      const data = await twitchApi.init();
      expect(data).toEqual('ok');
    });
  });

  describe('_init', () => {
    beforeEach(() => {
      vi.spyOn(window.localStorage.__proto__, 'setItem');
      vi.spyOn(twitchApi, 'requestAuthentication').mockResolvedValue({status: 204});
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      vi.spyOn(twitchApi, 'requestUsers').mockResolvedValue({status: 204, data: [{login: 'username', id: 0}]});
      vi.spyOn(twitchApi, '_authErrorCallback').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, '_onInitCallback').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, 'setStreamerInfo').mockResolvedValue(void 0);
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
    });
  });

  describe('resume', () => {
    beforeEach(() => {
      vi.spyOn(window.localStorage.__proto__, 'setItem');
      vi.spyOn(twitchApi, 'requestAuthentication').mockResolvedValue({status: 204});
      vi.spyOn(twitchApi, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      vi.spyOn(twitchApi, 'requestUsers').mockResolvedValue({status: 204, data: [{login: 'username', id: 0}]});
      vi.spyOn(twitchApi, '_authErrorCallback').mockResolvedValue(void 0);
      vi.spyOn(twitchApi, '_onInitCallback');
      vi.spyOn(twitchApi, 'setStreamerInfo').mockResolvedValue(void 0);
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
    });
  });

  describe('initChatClient', () => {
    test('should successfully connect to chat client', () => {
      const client = twitchApi.initChatClient();
      expect(client).toBeDefined();
    });
  });

  describe('closeChatClient', () => {
    test('should successfully disconnect chat client', () => {
      const disconnect = vi.fn();
      twitchApi._chatClient = { disconnect };
      twitchApi.closeChatClient();
      expect(disconnect).toHaveBeenCalled();
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

  describe('setStreamerInfo', () => {
    test('should save streamer info to localStorage', () => {
      vi.spyOn(window.localStorage.__proto__, 'setItem');
      twitchApi.setStreamerInfo({
        login: 'login',
        id: 'id',
        profile_image_url: 'url'
      });
      expect(window.localStorage.setItem).toHaveBeenCalledTimes(5);
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
      vi.spyOn(window.localStorage.__proto__, 'setItem');
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
    test('should return information about one or more users', async() => {
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

      expect(fetch).toHaveBeenCalledWith(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcasterId}`, {
        headers: {
          Authorization: 'Bearer mockAccessToken',
          'Client-ID': twitchApi._clientId,
        },
      });
      expect(response).toEqual(mockModeratorResponse);
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
      expect(response).toEqual(`Code sent to @${recipientUser.username}`);
      expect(twitchApi.sendMessage).toHaveBeenCalledWith(`/me ${response}`);
    });

    test('should post an error message to chat', async() => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        status: 403,
        json: () => Promise.resolve({status: 403, error: 'Forbidden'})
      });

      const response = await twitchApi.sendWhisper(recipientUser, 'Howdy!');
      expect(response).toEqual(`Error 403 sending to @${recipientUser.username}: Forbidden`);
      expect(twitchApi.sendMessage).toHaveBeenCalledWith(`/me ${response}`);
    });
    test('should catch an error and post an error message to chat', async() => {
      vi.spyOn(global.console, 'warn');
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
    });
  });

  describe('sendMessage', () => {
    test('should send the passed message to the chat', () => {
      const say = vi.fn();
      twitchApi._channel = 'user_name';
      twitchApi._chatClient = { say };
      twitchApi.sendMessage('Howdy!');
      expect(say).toHaveBeenCalledWith('user_name', 'Howdy!');
    });
  });

  describe('resetLocalStorageItems', () => {
    test('should remove saved items from localStorage', () => {
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
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
      vi.spyOn(twitchApi, 'resetLocalStorageItems');
      vi.spyOn(twitchApi, 'resetState');
      twitchApi.reset();
      expect(twitchApi.resetLocalStorageItems).toHaveBeenCalled();
      expect(twitchApi.resetState).toHaveBeenCalled();
      expect(window.location.hash).toBe('');
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
      expect(twitchApi.requestRefreshToken).toHaveBeenCalledTimes(1);
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
      vi.spyOn(window.localStorage.__proto__, 'getItem');
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
