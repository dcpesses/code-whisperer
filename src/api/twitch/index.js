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

    this._channel = null; // used when connected to a channel other than your own
    this._channelInfo = {};

    this._onMessageCallback = onMessage ?? noop;
    this._chatClient = null;
    this._joinAccounced = [];

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
  get isChatConnected() {return !!this._chatClient;}
  get isInit() {return this._isInit;}

  get channel() {return this._channel;}
  get channelInfo() {return this._channelInfo;}

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
        this.setUserInfo(userInfo[0]);
      }
      if (this.debug) {window.console.log('TwitchApi - init: isInit');}
      this._isInit = true;
      this._authError = false;
      await this.initChatClient();
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
    if (this.debug) {window.console.log('TwitchApi - resume');}
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
        this.setUserInfo(userInfo[0]);
      }
      if (this.debug) {window.console.log('TwitchApi - resume: isInit');}
      this._isInit = true;
      this._authError = false;
      this._onInitCallback();
      if (!this._chatClient) {
        if (this.debug) {window.console.log('TwitchApi - resume: calling initChatClient');}
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

  _initChatClient = async(channel, access_token, opts, callback) => {
    if (this.debug) {window.console.log('_initChatClient');}
    if (!channel) {
      channel = this._channel;
    }
    if (!access_token) {
      access_token = this._accessToken;
    }
    if (!callback) {
      callback = this.onMessageCallback; // can change during lifecycle
    }
    try {
      if (typeof this._chatClient?.disconnect === 'function') {
        await this._chatClient?.disconnect();
      }
    } catch (e) {
      window.console.warn('TwitchApi: Unable to disconnect existing chat client', e);
    }
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


    if (this.debug) {
      /*this._chatClient.on('chat', (channel, userstate, message, self) => {
        window.console.log('chatClient: chat', {channel, userstate, message, self});
      });
      this._chatClient.on('crash', (e) => {
        window.console.warn('chatClient: crashed', e);
      });
      this._chatClient.on('connected', () => {
        const date = new Date().toLocaleTimeString();
        this._chatClient.say(channel, `Connected to chat at ${date}`);
      });
      this._chatClient.on('connecting', (address, port) => {
        if (this.debug) {window.console.log('chatClient: Connecting', {address, port});}
      });
      this._chatClient.on('logon', () => {
        if (this.debug) {window.console.log('chatClient: Authenticating');}
      });
      this._chatClient.on('connectfail', () => {
        if (this.debug) {window.console.log('chatClient: Connection failed');}
      });
      this._chatClient.on('connected', (address, port) => {
        if (this.debug) {window.console.log('chatClient: Connected', {address, port});}
        this._joinAccounced = [];
      });
      this._chatClient.on('disconnected', (reason) => {
        if (this.debug) {window.console.log('chatClient: Disconnected: ' + (reason || ''));}
      });
      this._chatClient.on('reconnect', () => {
        if (this.debug) {window.console.log('chatClient: Reconnecting');}
      });
      this._chatClient.on('join', (channel, username) => {
        if (username === this._chatClient.getUsername()) {
          if (this.debug) {window.console.log('chatClient: Joined ' + channel);}
          this._joinAccounced.push(channel);
        }
      });
      this._chatClient.on('part', (channel, username) => {
        var index = this._joinAccounced.indexOf(channel);
        if (index > -1) {
          if (this.debug) {window.console.log('chatClient: Parted ' + channel + ' as ' + username);}
          this._joinAccounced.splice(this._joinAccounced.indexOf(channel), 1);
        }
      });
      this._chatClient.on('notice', (channel, msgid, message) => {
        if (this.debug) {window.console.log('chatClient: notice:', {channel, msgid, message});}
      });
      this._chatClient.on('ping', () => {
        if (this.debug) {window.console.log('chatClient: Ping!');}
      });*/
    }

    await this._chatClient.connect();
    return this._chatClient;
  };

  onMessageCallback = (channel, tags, msg, self) => {
    if (this.debug) {
      window.console.log('onMessageCallback', {channel, tags, msg, self});
    }
    try {
      this._onMessageCallback(channel, tags, msg, self);
    } catch (e) {
      window.console.warn('onMessageCallback: no callback set', e);
    }
  };

  closeChatClient = async() => {
    try {
      if (this._chatClient && typeof this._chatClient.disconnect === 'function') {
        const resp = await this._chatClient.disconnect();
        if (this.debug) {window.console.log('closeChatClient: disconnected');}
        return resp;
      }
    } catch (e) {
      window.console.log('Error', e);
    }
  };

  setUserInfo = (userInfo) => {
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

  /**
   * Leaves the current channel and joins the specified one
   * @param {string} channel username of the channel to join
   */
  switchChannel = async(channel) => {
    try {
      this._channel = channel;
      const channelInfo = await this.requestUserInfo({ login: channel });
      if (this.debug) {window.console.log('switchChannel', {channelInfo});}
      this.setChannelInfo(channelInfo.data[0]);
      await this._initChatClient();
      return channelInfo;
    } catch (e) {
      window.console.error('switchChannel - error', e);
    }
  };

  setChannelInfo = (channelInfo) => {
    if (channelInfo) {
      this._channelInfo = channelInfo;
      this._channel = channelInfo.login;
      localStorage.setItem('__channel', channelInfo.login);
      localStorage.setItem('__username', channelInfo.login);
      localStorage.setItem('__user_id', channelInfo.id);
      localStorage.setItem('__profile_image_url', channelInfo.profile_image_url);
    }
    return channelInfo;
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

  requestUserInfoBatch = async({ids=[], logins=[]}) => {
    let userIds, userLogins;
    if (ids.length > 0) {
      userIds = `id=${ids.join('&id=')}`;
    }
    if (logins.length > 0) {
      userLogins = `login=${logins.join('&login=')}`;
    }
    const requestParams = [userIds, userLogins].filter(param => param && param !== '').join('&');
    try {
      const response = await this.refetch(`https://api.twitch.tv/helix/users?${requestParams}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      const responseJson = await response.json();
      if (this.debug) {window.console.log('TwitchApi - requestUserInfoBatch: responseJson', responseJson);}
      return responseJson;
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestUserInfoBatch: error', error);}
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

  /**
   * Gets a list of channels that the specified user has moderator privileges in.
   * https://dev.twitch.tv/docs/api/reference/#get-moderated-channels
   * @param {string} id  A user’s ID. Returns the list of channels that this user has moderator privileges in. This ID must match the user ID in the user OAuth token
   * @returns {Object[]} data		The list of channels that the user has moderator privileges in.
   *  {string} broadcaster_id	String	An ID that uniquely identifies the channel this user can moderate.
   *  {string} broadcaster_login	String	The channel’s login name.
   *  {string} broadcaster_name	String	The channel’s display name.
   */
  requestModeratedChannels = async(id) => {
    try {
      const response = await fetch(`https://api.twitch.tv/helix/moderation/channels?user_id=${id}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      return await response.json();
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestModeratedChannels: error', error);}
      return await Promise.resolve(error);
    }
  };

  /**
   * Gets all users allowed to moderate the broadcaster’s chat room.
   * https://dev.twitch.tv/docs/api/reference/#get-moderators
   * @param {string|number} broadcasterId  The ID of the broadcaster whose list of moderators you want to get. This ID must match the user ID in the access token.
   * @param {string|number} after  The cursor used to get the next page of results. The Pagination object in the response contains the cursor’s value.
   * @returns {Object[]} data  The list of moderators.
   *  {string} user_id	String	The ID of the user that has permission to moderate the broadcaster’s channel.
   *  {string} user_name	String	The user’s display name.
   *  {string} user_login	String	The user’s login name.
   * @returns {Object[]} pagination  Contains the information used to page through the list of results. The object is empty if there are no more pages left to page through.
   *  {string} cursor	String	The cursor used to get the next page of results. Use the cursor to set the request’s after query parameter.
   */
  requestModerators = async(broadcasterId, after='') => {
    try {
      const response = await fetch(`https://api.twitch.tv/helix/moderation/moderators?first=100&after=${after}&broadcaster_id=${broadcasterId}`, {
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

  /**
   * Gets non-paginated list of all users allowed to moderate the broadcaster’s chat room.
   * https://dev.twitch.tv/docs/api/reference/#get-moderators
   * @param {string|number} broadcasterId  The ID of the broadcaster whose list of moderators you want to get. This ID must match the user ID in the access token.
   * @param {string|number} after  The cursor used to get the next page of results. The Pagination object in the response contains the cursor’s value.
   * @param {array} data  The list of moderators from a previous query to merge with the data from this response.
   * @returns {Array} The list of moderators.
   *  {string} user_id	String	The ID of the user that has permission to moderate the broadcaster’s channel.
   *  {string} user_name	String	The user’s display name.
   *  {string} user_login	String	The user’s login name.
   */
  requestAllModerators = async(broadcasterId, after='', data=[]) => {
    try {
      const response = await this.requestModerators(broadcasterId, after);
      if (response.data.length < 1 ) {
        return data;
      }
      data.push(...response.data);
      if (response.pagination.cursor) {
        return this.requestAllModerators(broadcasterId, response.pagination.cursor, data);
      }
      return data;
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestAllModerators: error', error);}
      return await Promise.resolve(error);
    }
  };

  /**
   * Gets a list of the broadcaster’s VIPs.
   * @param {string|number} broadcasterId  The ID of the broadcaster whose list of VIPs you want to get. This ID must match the user ID in the access token.
   * @param {Array} userIds  Filters the list for specific VIPs. The maximum number of IDs that you may specify is 100. Ignores the ID of those users in the list that aren’t VIPs.
   * @returns {Object[]} data  The list of VIPs. The list is empty if the broadcaster doesn’t have VIP users.
   *  {string} user_id	String	An ID that uniquely identifies the VIP user.
   *  {string} user_name	String	The user’s display name.
   *  {string} user_login	String	The user’s login name.
   */
  requestVIPs = async(broadcasterId, userIds=null) => {
    try {
      if (!userIds || userIds.length === 0) {
        userIds = '';
      } else {
        userIds = `&user_id=${userIds.join('&user_id=')}`;
      }
      const response = await fetch(`https://api.twitch.tv/helix/channels/vips?first=100&broadcaster_id=${broadcasterId}${userIds}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      return await response.json();
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - requestVIPs: error', error);}
      return await Promise.resolve(error);
    }
  };

  /**
   * Sends an announcement to the broadcaster’s chat room.
   * @param {string} message Announcement to make in the broadcaster's chat room
   * @param {string} color The color used to highlight the announcement. Accepted values: 'blue', 'green', 'orange', 'purple', 'primary' (default)
   * @param {string} broadcasterId The ID of the broadcaster that owns the chat room to send the announcement to.
   * @param {string} moderatorId The ID of a user who has permission to moderate the broadcaster’s chat room, or the broadcaster’s ID if they’re sending the announcement. This ID must match the user ID in the user access token.
   * @returns http status code:
   *  204 No Content
   *    Successfully sent the announcement.
   *  400 Bad Request
   *    The message field in the request's body is required.
   *    The message field may not contain an empty string.
   *    The string in the message field failed review.
   *    The specified color is not valid.
   *  401 Unauthorized
   *    The Authorization header is required and must contain a user access token.
   *    The user access token is missing the moderator:manage:announcements scope.
   *    The OAuth token is not valid.
   *    The client ID specified in the Client-Id header does not match the client ID specified in the OAuth token.
   */
  sendChatAnnouncement = async({message, broadcasterId, moderatorId, color}) => {
    if (this.debug) {window.console.log('sendAnnouncement:', message);}
    let requestBody = (color) ? {color, message} : {message};
    try {
      const response = await fetch(`https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          Authorization: `Bearer ${this._accessToken}`,
          'Client-ID': this._clientId,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - sendChatAnnouncement: error', error);}
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
    if (this.debug) {window.console.log('_sendWhisper:', {player, msg});}
    let requestParams = new URLSearchParams({
      from_user_id: this._userInfo.id,
      to_user_id: player.id
    });
    let requestBody = {message: msg};
    let response;
    try {
      await this.validateToken();
      response = await fetch(`https://api.twitch.tv/helix/whispers?${requestParams}`, {
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
          if (errJson.message) {
            errMsg += `: ${errJson.message}`;
          } else if (errJson.error) {
            errMsg += `: ${errJson.error}`;
          }
          errJson.player = player;
          if (this.debug) {window.console.log({errMsg, error: errJson});}
        } catch (e) {
          if (this.debug) {window.console.log({errMsg, error: e});}
        }
        const resp = await this.sendMessage(`/me ${errMsg}`);
        if (this.debug) {window.console.log('_sendWhisper: sendMessage', {resp});}
        // TODO: handle response and filter text using regexp pattern
        // responseTxt.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, '')
        return {msg: errMsg, status: response.status, error: errJson};
      }
      const msg = `Code sent to @${player.username}`;
      await this.sendMessage(`/me ${msg}`);
      return {msg, status: response.status};
    } catch (error) {
      const errMsg = `Error sending to @${player.username}, please check console for details.`;
      window.console.warn(`Error sending to @${player.username}:`, error);
      await this.sendMessage(`/me ${errMsg}`);
      return {msg: errMsg, status: response?.status, error};
    }
  };


  sendMessage = async(msg) => {
    if (this.debug) {window.console.log('sendMessage:', msg);}
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
    window.location.hash = '';
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
      window.console.log('TwitchApi - logout:', response);
      if (response.status === 200) {
        this.closeChatClient();
        this.reset();
      }
      return response;
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
        if (this.debug) {window.console.log('TwitchApi - validateToken: calling requestRefreshToken();...');}
        return await this.requestRefreshToken();
      }
      this._authError = false;
      return responseJson;
    } catch (e) {
      console.error(e);
      if (e.status === 401) {
        if (this.debug) {window.console.log('TwitchApi - validateToken error: calling requestRefreshToken();...');}
        return this.requestRefreshToken();
      }
      return;
    }
  };

  // equivalent to normal fetch but will retry once in case of network error
  refetch = async(endpoint, config) => {

    try {
      let response = await fetch(endpoint, config);
      return response;
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi.fetch', 'response NOT valid!');}
      if (this.debug) {window.console.warn(error);}
      try {
        const prevToken = this._accessToken || localStorage.getItem('__accessToken');
        const validateTokenResponse = await this.validateToken();
        if (this.debug) {window.console.log('TwitchApi.fetch', 'validate token: ok', validateTokenResponse);}
        // replace token if it exist in Authorization header
        let nextConfig = config;
        if (config?.headers?.Authorization) {
          let headerAuth = config.headers.Authorization;
          headerAuth = headerAuth.replace(prevToken, validateTokenResponse.access_token);
          nextConfig.headers.Authorization = headerAuth;
        }
        let response = await fetch(endpoint, nextConfig);
        if (this.debug) {window.console.log('TwitchApi.fetch', 'on retry: response valid!');}
        return response;
      } catch (err) {
        if (this.debug) {
          window.console.log('TwitchApi.fetch', 'validate session: error');
          window.console.warn(error);
          window.console.warn('*** NEEDS REAUTH ***');
        }
        throw error;
      }
    }
  };

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
