import queryString from 'query-string';

const noop = () => {};
export default class TwitchApi {
  constructor({
    clientId,
    clientSecret,
    redirectUri,
    code,
    accessToken,
    refreshToken,
    onInit,
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

    this._isAuth = false; // indicates if class has successfully authenticated
    this._isInit = false; // indicates if init() has both executed and completed
    this._authError = false; // indicates if error occurred during auth process

    this.debug = debug ?? (import.meta.env.MODE !== 'test' && !import.meta.env.PROD);

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

  _init = async() => {

    try {
      const oauth = await this.requestAuthentication();
      if (oauth.status >= 300 && oauth.message) {
        if (this.debug) {window.console.log('TwitchApi - init: oauth issue', oauth);}
        await this._authErrorCallback({oauth: null, users: null, error: oauth});
        return {oauth: null, users: null, error: oauth};
      }
      const users = await this.requestUsers();
      if (users.status >= 300 && users.message) {
        if (this.debug) {window.console.log('TwitchApi - init: users issue', users);}
        await this._authErrorCallback({oauth, users: null, error: users});
        return {oauth, users: null, error: users};
      }
      window.console.log('TwitchApi - init: isInit');
      this._isInit = true;
      this._authError = false;
      this._onInitCallback();
      return {oauth, users};
    } catch (e) {
      if (this.debug) {window.console.log('TwitchApi - init: error', e);}
      this._authError = true;
      this._authErrorCallback({oauth: null, users: null, error: e});
      return {oauth: null, users: null, error: e};
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
      const response = await fetch(`https://api.twitch.tv/helix/users?${requestParams}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      return await response.json();
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
      const response = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      const responseJson = await response.json();
      if (this.debug) {window.console.log('TwitchApi - requestUsers: responseJson', responseJson);}
      this._userInfo = responseJson;
      if (responseJson?.data[0]) {
        localStorage.setItem('__users', JSON.stringify(responseJson.data));
        localStorage.setItem('__username', responseJson.data[0].login);
        localStorage.setItem('__user_id', responseJson.data[0].id);
        localStorage.setItem('__profile_image_url', responseJson.data[0].profile_image_url);
      }
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

  resetLocalStorageItems() {
    localStorage.removeItem('__users');
    localStorage.removeItem('__username');
    localStorage.removeItem('__user_id');
    localStorage.removeItem('__profile_image_url');
    localStorage.removeItem('__access_token');
    localStorage.removeItem('__expires_in');
    localStorage.removeItem('__expiry_time');
    localStorage.removeItem('__refresh_token');
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

  async logOut() {
    const requestParams = new URLSearchParams({
      client_id: this._clientId,
      token: this._accessToken,
      redirect_uri: this._redirectUri,
    });

    try {
      await fetch(`https://id.twitch.tv/oauth2/revoke?${requestParams}`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json'
        }
      });
      return this.reset();
    } catch (error) {
      if (this.debug) {window.console.log('TwitchApi - logout: error', error);}
      return new Error();
    }
  }

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
}
