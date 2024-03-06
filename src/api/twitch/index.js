export default class TwitchApi {
  constructor({clientId, clientSecret, redirectUri, code, accessToken, refreshToken, onTokenUpdated}) {
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._redirectUri = redirectUri;
    this._code = code;
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
    this._updateTokens = onTokenUpdated;
    this._expires_in;
    this._expiry_time;
    this._userInfo;

    this.resetLocalStorageItems = this.resetLocalStorageItems.bind(this);
    this.requestAuthentication = this.requestAuthentication.bind(this);
    this.requestUsers = this.requestUsers.bind(this);
    this.requestModerators = this.requestModerators.bind(this);
    this.logOut = this.logOut.bind(this);
    this.requestRefreshToken = this.requestRefreshToken.bind(this);
    this.setAuthentication = this.setAuthentication.bind(this);
    this.validateToken = this.validateToken.bind(this);
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

  get onTokenUpdated() {return this._updateTokens;}
  set onTokenUpdated(onTokenUpdated) {this._updateTokens = onTokenUpdated;}

  get userInfo() {return this._userInfo;}

  get expires_in() {return this._expires_in;}

  get expiry_time() {return this._expiry_time;}


  async requestAuthentication({code}) {
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
      this.setAuthentication(responseJson);
      return responseJson;
    } catch (error) {
      return await Promise.resolve(error);
    }
  }

  async requestUserInfo({id, login}) {
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
      return await Promise.resolve(error);
    }
  }

  async requestUsers(access_token) {
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
      this._userInfo = responseJson;
      if (responseJson?.data[0]) {
        localStorage.setItem('__username', responseJson.data[0].login);
        localStorage.setItem('__user_id', responseJson.data[0].id);
        localStorage.setItem('__profile_image_url', responseJson.data[0].profile_image_url);
      }
      return responseJson;
    } catch (error) {
      return await Promise.resolve(error);
    }
  }

  async requestModerators(broadcasterId) {
    try {
      const response = await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${broadcasterId}`, {
        headers: {
          'Client-ID': this._clientId,
          Authorization: `Bearer ${this._accessToken}`
        }
      });
      return await response.json();
    } catch (error) {
      return await Promise.resolve(error);
    }
  }

  resetLocalStorageItems() {
    localStorage.removeItem('__username');
    localStorage.removeItem('__user_id');
    localStorage.removeItem('__profile_image_url');
    localStorage.removeItem('__access_token');
    localStorage.removeItem('__expires_in');
    localStorage.removeItem('__expiry_time');
    localStorage.removeItem('__refresh_token');
  }

  async logOut() {
    const requestParams = new URLSearchParams({
      client_id: this._clientId,
      token: this._accessToken,
      redirect_uri: this._redirectUri,
    });

    try {
      return await fetch(`https://id.twitch.tv/oauth2/revoke?${requestParams}`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json'
        }
      });
    } catch {
      return new Error();
    }
  }

  async requestRefreshToken(refresh_token) {
    if (refresh_token) {
      this._refreshToken = refresh_token;
    }
    const requestParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this._clientId,
      client_secret: this._clientSecret,
      refresh_token: this._refreshToken
    });
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
  }

  /**
   * Handles the API response after authenticating
   *
   * @param {object} oauth The api response object (access_token, refresh_token, expires_in, scope)
   * @returns Promise (via requestUsers)
   */
  setAuthentication(oauth) {
    let expiry_time = Date.now() + oauth.expires_in;
    localStorage.setItem('__access_token', oauth.access_token);
    localStorage.setItem('__expires_in', oauth.expires_in);
    localStorage.setItem('__expiry_time', expiry_time);
    localStorage.setItem('__refresh_token', oauth.refresh_token);

    this.access_token = oauth.access_token;
    this.refresh_token = oauth.refresh_token;
    this.expires_in = oauth.expires_in;
    this.expiry_time = oauth.expiry_time;
  }

  async validateToken(token) {
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
      this.setAuthentication(responseJson);
      if (responseJson.status === 401) {
        console.log('calling this.requestRefreshToken();...');
        return this.requestRefreshToken();
      }
      return responseJson;
    } catch (e) {
      console.error(e);
      if (e.status === 401) {
        console.log('calling this.requestRefreshToken();...');
        return this.requestRefreshToken();
      }
      return;
    }


  }
}
