import queryString from 'query-string';
import tmi from 'tmi.js';

export const noop = () => {};

export const ActivityStatus = {
  ACTIVE: 1,
  IDLE: 2,
  DISCONNECTED: 3
};

export const MAX_IDLE_TIME_MINUTES = 10;

export default class TwitchApi {
  constructor({
    clientId,
    clientSecret,
    redirectUri,
    code,
    accessToken,
    refreshToken,
    onInit,
    onMessage,
    onTokenUpdate,
    authError,
    debug,
    init = true,
  }) {
    this._clientId = clientId ?? import.meta.env.VITE_APP_TWITCH_CLIENT_ID ?? null;
    this._clientSecret = clientSecret ?? import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET ?? null;
    this._redirectUri = redirectUri ?? import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE ?? null;
    this._code = code ?? null;
    this._accessToken = accessToken ?? localStorage.getItem('__access_token') ?? null;
    this._refreshToken = refreshToken ?? localStorage.getItem('__refresh_token') ?? null;
    this._onTokenUpdateCallback = onTokenUpdate ?? noop;
    this._onInitCallback = onInit ?? noop;
    this._authErrorCallback = authError ?? noop;
    this._expires_in = null;
    this._expiry_time = null;
    this._userInfo = {};

    this._channel = null;
    this._onMessageCallback = onMessage ?? noop;
    this._chatClient = null;

    this._lastMessageTimes = {};

    this._isAuth = false; // indicates if class has successfully authenticated
    this._isInit = false; // indicates if init() has both executed and completed
    this._authError = false; // indicates if error occurred during auth process

    this.debug = debug ?? (!import.meta.env.PROD & import.meta.env.MODE !== 'test');

    if (this.debug) {
      window.console.log('TwitchApi constructed');
      window.console.log('TwitchApi:', window.location.hash);
    }

    if (init === true) {
      return this.init();
    }
  }

  get clientId() {return this._clientId;}
  set clientId(clientId) {this._clientId = clientId;}

  get clientSecret() {return this._clientSecret;}
  set clientSecret(clientSecret) {this._clientSecret = clientSecret;}

  get redirectUri() {return this._redirectUri;}
  set redirectUri(redirectUri) {this._redirectUri = redirectUri;}

  get code() {return this._code;}
  set code(code) {this._code = code;}

  get accessToken() {return this._accessToken;}
  set accessToken(accessToken) {this._accessToken = accessToken;}

  get refreshToken() {return this._refreshToken;}
  set refreshToken(refreshToken) {this._refreshToken = refreshToken;}

  get onInit() {return this._onInit;}
  set onInit(callback) {
    if (typeof callback === 'function') {
      this._onInit = callback;
    }
  }

  get onMessage() {return this._onMessageCallback;}
  set onMessage(callback) {
    if (typeof callback === 'function') {
      this._onMessageCallback = callback;
    }
  }

  get onTokenUpdate() {return this._onTokenUpdateCallback;}
  set onTokenUpdate(callback) {
    if (typeof callback === 'function') {
      this._onTokenUpdateCallback = callback;
    }
  }

  get authError() {return this._authErrorCallback;}
  set authError(callback) {
    if (typeof callback === 'function') {
      this._authErrorCallback = callback;
    }
  }

  get userInfo() {return this._userInfo;}

  get expires_in() {return this._expires_in;}

  get expiry_time() {return this._expiry_time;}

  get isAuth() {return this._isAuth;}
  get isInit() {return this._isInit;}

  get channel() {return this._channel;}
  get lastMessageTimes() {return this._lastMessageTimes;}

  _init = async() => {

    try {
      const oauth = await this.requestAuthentication();
      if (oauth.status >= 300 && oauth.message) {
        if (this.debug) {window.console.log('TwitchApi - init: oauth issue', oauth);}
        await this._authErrorCallback({oauth, users: null, valid: null, error: true});
        return {oauth, users: null, valid: null, error: true, instance: this};
      }
      const valid = await this.validateToken();
      if (valid.status >= 300 && valid.message) {
        if (this.debug) {window.console.log('TwitchApi - init: valid issue', valid);}
        await this._authErrorCallback({oauth, users: null, valid, error: true});
        return {oauth, users: null, valid, error: true, instance: this};
      }
      const users = await this.requestUsers();
      if (users.status >= 300 && users.message) {
        if (this.debug) {window.console.log('TwitchApi - init: users issue', users);}
        await this._authErrorCallback({oauth, users, valid, error: true});
        return {oauth, users, valid, error: true, instance: this};
      }
      this._channel = valid.login;
      localStorage.setItem('__channel', valid.login);
      let userInfo = users.data.filter(u => u.login === valid.login);
      if (userInfo.length === 1) {
        this.setStreamerInfo(userInfo[0]);
      }
      window.console.log('TwitchApi - init: isInit');
      this._isInit = true;
      this._authError = false;
      this.initChatClient();
      this._onInitCallback();
      return {oauth, users, valid, instance: this};
    } catch (e) {
      if (this.debug) {window.console.log('TwitchApi - init: error', e);}
      this._authError = true;
      this._authErrorCallback({oauth: null, users: null, valid: null, error: e});
      return {oauth: null, users: null, valid: null, error: e, instance: this};
    }
  };

  init = async(q) => {
    let queryStr = q ?? window.location.hash.substring(1);
    const queryParams = queryString.parse(queryStr);
    this.code = queryParams.code;
    if (this.debug) {
      window.console.log('TwitchApi:', {code: this.code});
    }

    if (
      this._clientId &&
      this._clientSecret &&
      this._redirectUri &&
      this._code
    ) {
      if (this.debug) {window.console.log('TwitchApi: init()');}
      return await this._init();
    } else {
      // Tell me why-y (Ain't nothing but a heartache)
      let varNames = [
        'clientId',
        'clientSecret',
        'redirectUri',
        'code',
      ].map((param) => {
        // "Hello, McFly? Anybody home?"
        return (!this[`_${param}`]) ? param : null;
      }).filter(p => p);

      return {error: `Missing one or more required parameters: ${varNames.join(', ')}`};
    }
  };

  resume = async(accessToken, oauth={}) => {
    if (!accessToken) {
      if (!this._accessToken) {
        window.console.warn('TwitchApi - resume: error', 'accessToken not valid');
        return;
      }
      accessToken = this._accessToken;
    }
    try {
      const valid = await this.validateToken(accessToken);
      if (valid.status >= 300 && valid.message) {
        if (this.debug) {window.console.log('TwitchApi - resume: valid issue', valid);}
        await this._authErrorCallback({oauth, users: null, valid, error: true});
        return {oauth, users: null, valid, error: true, instance: this};
      }
      const users = await this.requestUsers();
      if (users.status >= 300 && users.message) {
        if (this.debug) {window.console.log('TwitchApi - resume: users issue', users);}
        await this._authErrorCallback({oauth, users, valid, error: true});
        return {oauth, users, valid, error: true, instance: this};
      }
      this._channel = valid.login;
      localStorage.setItem('__channel', valid.login);
      let userInfo = users.data.filter(u => u.login === valid.login);
      if (userInfo.length === 1) {
        this.setStreamerInfo(userInfo[0]);
      }
      window.console.log('TwitchApi - resume: isInit');
      this._isInit = true;
      this._authError = false;
      this._onInitCallback();
      if (!this._chatClient) {
        this.initChatClient();
      }
      return {oauth, users, valid, instance: this};
    } catch (e) {
      if (this.debug) {window.console.log('TwitchApi - resume: error', e);}
      this._authError = true;
      this._authErrorCallback({oauth: null, users: null, valid: null, error: e});
      return {oauth: null, users: null, valid: null, error: e, instance: this};
    }
  };

  initChatClient = (callback, username=null, access_token=null, options=null) => {
    const client = this._initChatClient(username, access_token, options, callback);
    return client;
  };

  _initChatClient = (channel, access_token, opts, callback) => {
    if (!channel) {
      channel = this._channel;
    }
    if (!access_token) {
      access_token = this._accessToken;
    }
    if (!callback) {
      callback = this._onMessageCallback;
      if (!callback && this.debug) {
        callback = window.console.log;
      }
    }
    window.console.log('_initChatClient');
    this._chatClient = new tmi.client({
      identity: {
        username: channel,
        password: access_token
      },
      channels: [channel],
      options: Object.assign({}, {
        skipUpdatingEmotesets: true,
        updateEmotesetsTimer: 0
      }, opts),
    });
    this._chatClient.on('message', callback);
    this._chatClient.connect();
    return this._chatClient;
  };

  closeChatClient = () => {
    try {
      if (this._chatClient && typeof this._chatClient.disconnect === 'function') {
        const resp = this._chatClient.disconnect();
        this._chatClient = null;
        return resp;
      }
    } catch (e) {
      window.console.log('Error', e);
    }
  };

  setStreamerInfo = (userInfo) => {
    if (userInfo) {
      this._userInfo = userInfo;
      this._channel = userInfo.login;
      localStorage.setItem('__channel', userInfo.login);
      localStorage.setItem('__users', JSON.stringify(userInfo));
      localStorage.setItem('__username', userInfo.login);
      localStorage.setItem('__user_id', userInfo.id);
      localStorage.setItem('__profile_image_url', userInfo.profile_image_url);
    }
    return userInfo;
  };

  requestAuthentication = async(code) => {
    if (code) {
      this._code = code;
    }
    const requestParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: this._code,
      redirect_uri: this._redirectUri,
      client_id: this._clientId,
      client_secret: this._clientSecret,
    });

    try {
      const response = await fetch(`https://id.twitch.tv/oauth2/token?${requestParams}`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json'
        }
      });
      const responseJson = await response.json();
      return this.setAuthentication(responseJson);
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestAuthentication: error', error);}
      return await Promise.resolve(error);
    }
  };

  /**
   * Handles the API response after authenticating
   *
   * @param {object} oauth The api response object (access_token, refresh_token, expires_in, scope)
   * @returns Promise (via requestUsers)
   */
  setAuthentication = (oauth) => {
    if (oauth.access_token) {
      this._accessToken = oauth.access_token;
      localStorage.setItem('__access_token', oauth.access_token);
    }
    if (oauth.expires_in) {
      let expiry_time = Date.now() + oauth.expires_in;
      this._expires_in = oauth.expires_in;
      this._expiry_time = expiry_time;
      localStorage.setItem('__expires_in', oauth.expires_in);
      localStorage.setItem('__expiry_time', expiry_time);
    }
    if (oauth.refresh_token) {
      this._refreshToken = oauth.refresh_token;
      localStorage.setItem('__refresh_token', oauth.refresh_token);
    }
    this._authError = false;
    return oauth;
  };

  requestUserInfo = async({id, login}) => {
    let params = {};
    if (id) {
      params.id = id;
    }
    if (login) {
      params.login = login;
    }
    const requestParams = new URLSearchParams(params);
    try {
      const response = await this.refetch(`https://api.twitch.tv/helix/users?${requestParams}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      const responseJson = await response.json();
      if (this.debug) {window.console.log('TwitchApi - requestUserInfo: responseJson', responseJson);}
      return responseJson;
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestUserInfo: error', error);}
      return await Promise.resolve(error);
    }
  };

  requestUsers = async(access_token) => {
    if (access_token) {
      this._accessToken = access_token;
    }
    try {
      const response = await this.refetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      const responseJson = await response.json();
      if (this.debug) {window.console.log('TwitchApi - requestUsers: responseJson', responseJson);}

      return responseJson;
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestUsers: error', error);}
      return await Promise.resolve(error);
    }
  };

  requestModerators = async(broadcasterId) => {
    try {
      const response = await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcasterId}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      return await response.json();
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestModerators: error', error);}
      return await Promise.resolve(error);
    }
  };


  // https://dev.twitch.tv/docs/api/reference/#send-whisper
  // note: access token must include user:manage:whispers scope
  // note: sending user must have a verified phone number
  /**
     * Sends a message to the user specified in the player object
     * @param {object} player Contains the username and id of recipient
     * @param {string} msg The message to be sent
     * @returns Promise
     */
  sendWhisper = async(player, msg) => {
    return await this._sendWhisper({player, msg});
  };
  _sendWhisper = async({player, msg}) => {
    let requestParams = new URLSearchParams({
      from_user_id: this._userInfo.id,
      to_user_id: player.id
    });
    let requestBody = {message: msg};
    try {
      await this.validateToken();
      const response = await fetch(`https://api.twitch.tv/helix/whispers?${requestParams}`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          Authorization: `Bearer ${this._accessToken}`,
          'Client-ID': this._clientId,
          'Content-Type': 'application/json'
        }
      });
      if (response.status !== 204) {
        let errMsg = `Error ${response.status} sending to @${player.username}`;
        // let's make sure we don't throw anything while constructing our error msg!
        let errJson;
        try {
          errJson = await response.json();
          if (errJson.error) {
            errMsg += `: ${errJson.error}`;
          }
          errJson.player = player;
          window.console.log({errMsg, error: errJson});
        } catch (e) {
          window.console.log({errMsg, error: e});
        }
        await this.sendMessage(`/me ${errMsg}`);
        return errMsg;
      }
      const msg = `Code sent to @${player.username}`;
      await this.sendMessage(`/me ${msg}`);
      return msg;
    } catch (error) {
      const errMsg = `Error sending to @${player.username}, please check console for details.`;
      window.console.warn(`Error sending to @${player.username}:`, error);
      await this.sendMessage(`/me ${errMsg}`);
      return errMsg;
    }
  };

  sendMessage = async(msg) => {
    return await this._chatClient.say(this._channel, msg);
  };

  resetLocalStorageItems() {
    localStorage.removeItem('__users');
    localStorage.removeItem('__username');
    localStorage.removeItem('__user_id');
    localStorage.removeItem('__profile_image_url');
    localStorage.removeItem('__access_token');
    localStorage.removeItem('__expires_in');
    localStorage.removeItem('__expiry_time');
    localStorage.removeItem('__refresh_token');

    localStorage.removeItem('__login');
    localStorage.removeItem('__user_id');
  }

  resetState() {
    this._username = undefined;
    this._user_id = undefined;
    this._profile_image_url = undefined;
    this._accessToken = undefined;
    this._expires_in = undefined;
    this._expiry_time = undefined;
    this._refreshToken = undefined;
  }

  reset = () => {
    if (this.debug) {window.console.log('TwitchApi - reset()');}
    this.resetState();
    this.resetLocalStorageItems();
  };

  logOut = async() => {
    const requestParams = new URLSearchParams({
      client_id: this._clientId,
      token: this._accessToken,
      redirect_uri: this._redirectUri,
    });

    try {
      const response = await fetch(`https://id.twitch.tv/oauth2/revoke?${requestParams}`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json'
        }
      });
      const responseJson = await response.json();
      if (responseJson.status === 204) {
        this.reset();
      }
      return responseJson;
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - logout: error', error);}
      return new Error();
    }
  };

  requestRefreshToken = async(refresh_token) => {
    if (refresh_token) {
      this._refreshToken = refresh_token;
    }
    const requestParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this._clientId,
      client_secret: this._clientSecret,
      refresh_token: this._refreshToken
    });
    try {
      const response = await fetch(`https://id.twitch.tv/oauth2/token?${requestParams}`, {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${this._refreshToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const responseJson = await response.json();
      this.setAuthentication(responseJson);
      return responseJson;
    } catch (e) {
      this._authError = true;
    }
  };


  validateToken = async(token) => {
    if (this.debug) {window.console.log('TwitchApi - validateToken', token);}
    if (!token) {
      token = this._accessToken;
    }
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/validate', {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${token}`
        }
      });
      const responseJson = await response.json();
      if (responseJson.status === 401) {
        window.console.log('TwitchApi - validateToken: calling requestRefreshToken();...');
        return await this.requestRefreshToken();
      }
      this._authError = false;
      return responseJson;
    } catch (e) {
      console.error(e);
      if (e.status === 401) {
        window.console.log('TwitchApi - validateToken error: calling requestRefreshToken();...');
        return this.requestRefreshToken();
      }
      return;
    }
  };

  // equivalent to normal fetch but will retry once in case of network error
  refetch = async(endpoint, config) => {

    try {
      let response = await fetch(endpoint, config);
      // response = await this.handleApiInvalid(response);
      return response;
    } catch (error) {
      window.console.log('TwitchApi.fetch', 'response NOT valid!');
      window.console.warn(error);
      try {
        const prevToken = this._accessToken || localStorage.getItem('__accessToken');
        const validateTokenResponse = await this.validateToken();
        window.console.log('TwitchApi.fetch', 'validate token: ok', validateTokenResponse);
        // replace token if it exist in Authorization header
        let nextConfig = config;
        if (config?.headers?.Authorization) {
          let headerAuth = config.headers.Authorization;
          headerAuth = headerAuth.replace(prevToken, validateTokenResponse.access_token);
          nextConfig.headers.Authorization = headerAuth;
        }
        let response = await fetch(endpoint, nextConfig);
        // response = await this.handleApiInvalid(response);
        window.console.log('TwitchApi.fetch', 'on retry: response valid!');
        return response;
      } catch (err) {
        window.console.log('TwitchApi.fetch', 'validate session: error');
        window.console.warn(error);
        window.console.warn('*** NEEDS REAUTH ***');
        throw error;
      }
    }
  };

  // throw an error for invalid response
  // not yet tested
  handleApiInvalid = (response) => {
    if (response.status >= 300) {
      if (response.status >= 500) {
        return window.console.error('TwitchApi:', 'Please check Twitch status page: https://status.twitch.com/');
      }
      throw response;
    }
    return response;
  };

  // ChatActivity Status

  updateLastMessageTime = (user) => {
    this._lastMessageTimes = {
      ...this._lastMessageTimes,
      [user]: Date.now()
    };
  };

  minsSinceLastChatMessage = (user) => {
    return Math.floor((Date.now() - this._lastMessageTimes[user]) / 60000);
  };

  requestChatters = async(first=500, after=null) => {
    if (this.debug) {window.console.log('requestChatters: this._userInfo', this._userInfo);}
    const params = {
      broadcaster_id: this._userInfo.id,
      moderator_id: this._userInfo.id,
      first,
    };
    if (after !== null) {
      params.after = after;
    }
    const requestParams = new URLSearchParams(params);
    try {
      const response = await fetch(`https://api.twitch.tv/helix/chat/chatters?${requestParams}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      return await response.json();
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestChatters: error', error);}
      return await Promise.resolve(error);
    }
  };

  getChatterStatus = async(user) => {
    // broadcaster always counts as active
    if (user === this.channel) {
      return ActivityStatus.ACTIVE;
    }

    // sent a chat message in the last X mins?
    if (this._lastMessageTimes[user] && this.minsSinceLastChatMessage(user) < MAX_IDLE_TIME_MINUTES) {
      return ActivityStatus.ACTIVE;
    }

    let chatters = await this.requestChatters();
    if (!chatters?.data || chatters.data.length === 0) {
      return ActivityStatus.DISCONNECTED;
    }
    chatters = chatters.data.map(c => c.user_login);
    if (!chatters.includes(user)) {
      return ActivityStatus.DISCONNECTED;
    }
    return ActivityStatus.IDLE;
  };
}
