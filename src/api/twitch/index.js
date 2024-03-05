export default class TwitchApi {
  constructor({channel, clientId, clientSecret, redirectUri, code, accessToken, refreshToken, onTokenUpdated}) {
    this._channel = channel;
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._redirectUri = redirectUri;
    this._code = code;
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
    this._updateTokens = onTokenUpdated;


    this.requestAuthentication = this.requestAuthentication.bind(this);
    this.requestUsers = this.requestUsers.bind(this);
    this.requestModerators = this.requestModerators.bind(this);
    this.logOut = this.logOut.bind(this);
    this.requestRefreshToken = this.requestRefreshToken.bind(this);
    this.validateToken = this.validateToken.bind(this);

    // this.lastMessageTimes = {};
    // this.getUsers = this.gsers.bind(this);
    // this.logOut = this.logOut.bind(this);
    // this.onAuthenticated = this.onAuthenticated.bind(this);
    // this.promisedSetState = this.promisedSetState.bind(this);
    // this.refreshToken = this.refreshToken.bind(this);
    // this.validateToken = this.validateToken.bind(this);

    // this.getStatusPromise = this.getStatusPromise.bind(this);

    // this.sendWhisper = this.sendWhisper.bind(this);
  }

  get channel() {return this._channel;}
  set channel(channel) {this._channel = channel;}

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

  async requestAuthentication({code}) {
    if (code) {
      this._code = code;
    }
    const requestParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: this._code,
      redirect_uri: this._redirectUri, // import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE,
      client_id: this._clientId, // import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
      client_secret: this._clientSecret, // import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET
    });

    try {
      const response = await fetch(`https://id.twitch.tv/oauth2/token?${requestParams}`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json'
        }
      });
      return await response.json();
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
      return await response.json();
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

  async logOut() {
    const requestParams = new URLSearchParams({
      client_id: this._clientId, // import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
      token: this._accessToken,
      redirect_uri: this._redirectUri, // import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE
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
      client_id: this._clientId, // import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
      client_secret: this._clientSecret, // import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET
      refresh_token: this._refreshToken
    });
    return await fetch(`https://id.twitch.tv/oauth2/token?${requestParams}`, {
      method: 'POST',
      headers: {
        Authorization: `OAuth ${this._refreshToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(r => r.json());
  }

  async validateToken(token) {
    if (!token) {
      token = this.state.access_token;
    }
    return await fetch('https://id.twitch.tv/oauth2/validate', {
      method: 'GET',
      headers: {
        Authorization: `OAuth ${token}`
      }
    }).then(r => r.json());
    // .then(validateResp => {
    //   if (validateResp.status === 401) {
    //     console.log('calling requestRefreshToken();...');
    //     return this.requestRefreshToken();
    //   }
    //   return Promise.resolve();
    // })
    // .catch(e => {
    //   console.error(e);
    //   if (e.status === 401) {
    //     console.log('calling requestRefreshToken();...');
    //     return this.requestRefreshToken();
    //   }
    //   return;
    // });
  }
}
