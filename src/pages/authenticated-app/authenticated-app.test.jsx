/* eslint-env jest */
import AuthenticatedApp, {AuthenticatedApp as AuthenticatedAppComponent, TWITCH_API, noop} from '@/pages/authenticated-app';
import { render, screen } from '@testing-library/react';
import { mockWindowLocation } from '@/../tests/mockWindowLocation';
import { Provider } from 'react-redux';
import { getStoreWithState } from '@/app/store';
// import Landing from '@/pages/landing';
import React from 'react';
import {vi} from 'vitest';

globalThis.jest = {
  ...globalThis.jest,
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi)
};

global.fetch = vi.fn();
vi.mock('tmi.js');

// vi.mock('@/components/main-screen', () => ({
//   default: ({onLogOut, onTwitchAuthError, has_logged_out}) => (
//     <div data-testid="MainScreenMock">
//       <button onClick={onLogOut}>
//         Log Out
//       </button>
//       <button onClick={onTwitchAuthError}>
//         Auth
//       </button>
//       <span data-testid="has_logged_out">
//         {has_logged_out ? has_logged_out.toString() : 'null'}
//       </span>
//     </div>
//   )
// }));
vi.mock('@/components/main-screen', () => ({
  default: () => (
    <div data-testid="MainScreenMock" />
  )
}));

vi.mock('@/pages/landing', () => ({
  default: () => (
    <div data-testid="LandingMock">
      Landing
    </div>
  )
}));

/*
const originalSetState = React.Component.prototype.setState;
vi.spyOn(React.Component.prototype, 'setState').mockImplementation(
  (this, ...args) => {
    const [update, callback] = args;

    const wrappedCallback = callback && (() => act(() => callback()));

    originalSetState.apply(this, [update, wrappedCallback]);
  }
);
*/

vi.mock('react-router-dom', () => {
  const reactRouterDom = vi.importActual('react-router-dom');
  return {
    ...reactRouterDom,
    useLocation: () => ({
      pathname: 'http://localhost:5173/code-whisperer/#'
    }),
    useNavigate: () => ({}),
    useParams: () => ({}),
    // eslint-disable-next-line react/display-name
    Navigate: () => () => (<div>React Tooltip Mock</div>),
    redirect: vi.fn()
  };
});

const getMockTwitchApi = (overrides={}) => Object.assign({
  isChatConnected: true,
  _chatClient: {},
  onMessage: vi.fn(),
  sendMessage: vi.fn().mockResolvedValue([]),
  updateLastMessageTime: vi.fn(),
}, overrides);

const storeState = {
  channel: {
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
  },
  user: {
    info: {
      id: '0',
      login: 'twitchuser',
      display_name: 'TwitchUser',
      type: '',
      broadcaster_type: '',
      description: 'description',
      profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
      offline_image_url: '',
      view_count: 0,
      created_at: '2019-11-18T00:47:34Z'
    },
    chatters: {
      twitchuser: {
        id: '0',
        login: 'twitchuser',
        display_name: 'TwitchUser',
        type: '',
        broadcaster_type: '',
        description: 'description',
        profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
        offline_image_url: '',
        view_count: 0,
        created_at: '2019-11-18T00:47:34Z'
      }
    },
    moderatedChannels: [{
      broadcaster_id: '1',
      broadcaster_login: 'TwitchStreamer',
      broadcaster_name: 'twitchstreamer',
    }],
    whisperStatus: {
      twitchuser: {
        login: 'twitchuser',
        response: {
          msg: 'Code sent to @TwitchUser',
          status: 204
        }
      },
    }
  }
};


describe('noop', () => {
  test('should execute without error', () => {
    expect(noop()).toBeUndefined();
  });
});

describe('AuthenticatedApp', () => {

  let props = {
    history: {
      length: 3,
      action: 'POP',
      location: {
        pathname: '/',
        search: '?code=foobar&scope=chat:read chat:edit moderation:read whispers:edit',
        hash: ''
      }
    },
    match: {
      path: '/',
      url: '/',
      isExact: true,
      params: {}
    }
  };

  describe('componentDidMount', () => {
    test('should call onDelayedMount', () => {
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onDelayedMount').mockResolvedValue(null);

      component.componentDidMount();
      expect(component.onDelayedMount).toHaveBeenCalledTimes(1);
    });
  });

  describe('onMount', () => {

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['queueMicrotask'] });
      // "Calm down, Marty, Einstein and the car are completely intact."
      vi.spyOn(Date, 'now').mockReturnValue(499162860000); // October 26, 1985 1:21:00 AM PST
    });
    afterEach(() => {
      vi.useRealTimers();
    });
    test('should reuse existing access token from localStorage if available', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        if (label === '__access_token') {
          return 'MOCK TOKEN';
        }
        if (label === '__expiry_time') {
          return '499163700000'; // October 26, 1985 1:35:00 AM PST
        }
        return null;
      });
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        accessToken: null,
        resume: vi.fn().mockResolvedValue({
          oauth: {},
          users: {},
          valid: {},
        })
      };

      await component.onMount();
      expect(component.twitchApi.accessToken).toBe('MOCK TOKEN');
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });

    test('should attempt to reuse existing access token, handle error response, and call init', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        if (label === '__access_token') {
          return 'MOCK TOKEN';
        }
        if (label === '__expiry_time') {
          return '499163700000'; // October 26, 1985 1:35:00 AM PST
        }
        return null;
      });
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        accessToken: null,
        init: vi.fn().mockResolvedValue({
          oauth: {}, users: {}, valid: {}, instance: {}
        }),
        resume: vi.fn().mockResolvedValue({
          oauth: {},
          users: {},
          valid: {},
          error: {},
        })
      };

      await component.onMount();
      expect(component.twitchApi.accessToken).toBe('MOCK TOKEN');
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });

    test('should catch errors on attempt to reuse existing access token and call init', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        if (label === '__access_token') {
          return 'MOCK TOKEN';
        }
        if (label === '__expiry_time') {
          return '499163700000'; // October 26, 1985 1:35:00 AM PST
        }
        return null;
      });
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        accessToken: null,
        resume: vi.fn().mockRejectedValue({
          oauth: {},
          users: {},
          valid: {},
          error: {},
        }),
        init: vi.fn().mockResolvedValue({
          oauth: {}, users: {}, valid: {}, instance: {}
        })
      };

      await component.onMount();
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });

    test('should use refresh token from localStorage to generate new token', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        if (label === '__access_token') {
          return 'MOCK TOKEN';
        }
        if (label === '__refresh_token') {
          return 'MOCK REFRESH TOKEN';
        }
        if (label === '__expiry_time') {
          return '499162800000'; // October 26, 1985 1:20:00 AM PST
        }
        return null;
      });
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        accessToken: null,
        requestRefreshToken: vi.fn().mockResolvedValue({
          access_token: 'MOCK TOKEN'
        }),
        _requestToken: null,
        resume: vi.fn().mockResolvedValue({
          oauth: {},
          users: {},
          valid: {},
        })
      };

      await component.onMount();
      // expect(component.twitchApi.requestToken).toBe('MOCK REFRESH TOKEN');
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });

    test('should attempt to use refresh token to generate new token, handle error response, and call init', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        if (label === '__access_token') {
          return 'MOCK TOKEN';
        }
        if (label === '__refresh_token') {
          return 'MOCK REFRESH TOKEN';
        }
        if (label === '__expiry_time') {
          return '499162800000'; // October 26, 1985 1:20:00 AM PST
        }
        return null;
      });
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        accessToken: null,
        init: vi.fn().mockResolvedValue({
          oauth: {}, users: {}, valid: {}, instance: {}
        }),
        requestRefreshToken: vi.fn().mockResolvedValue({
          error: 'mock error response'
        }),
        _requestToken: null,
        resume: vi.fn().mockResolvedValue({
          oauth: {},
          users: {},
          valid: {},
          error: {},
        })
      };

      await component.onMount();
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });

    test('should catch errors on attempt to use refresh token to generate new token and call init', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        if (label === '__access_token') {
          return 'MOCK TOKEN';
        }
        if (label === '__refresh_token') {
          return 'MOCK REFRESH TOKEN';
        }
        if (label === '__expiry_time') {
          return '499162800000'; // October 26, 1985 1:20:00 AM PST
        }
        return null;
      });
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        accessToken: null,
        requestRefreshToken: vi.fn().mockResolvedValue({
          error: 'mock error response'
        }),
        _requestToken: null,
        resume: vi.fn().mockRejectedValue({
          oauth: {},
          users: {},
          valid: {},
          error: {},
        }),
        init: vi.fn().mockResolvedValue({
          oauth: {}, users: {}, valid: {}, instance: {}
        })
      };

      await component.onMount();
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });

    test('should initialize the Twitch API class and call onTwitchAuthInit when completed', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(undefined);
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        _accessToken: null,
        init: vi.fn().mockResolvedValue({auth: true, users: true})
      };

      await component.onMount();
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });

    test('should throw a No Response error when initializing the Twitch API class', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(undefined);
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      vi.spyOn(component, 'onTwitchAuthError');
      component.twitchApi = {
        _accessToken: null,
        init: vi.fn().mockResolvedValue(null)
      };
      try {
        await component.onMount();
      } catch (error) {
        expect(error).toBe('No Response');
        expect(component.onTwitchAuthError).toHaveBeenCalled();
        expect(component.onTwitchAuthInit).not.toHaveBeenCalled();
      }
    });

    test('should throw the initResponse error response when initializing the Twitch API class', async() => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(undefined);
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'onTwitchAuthInit');
      vi.spyOn(component, 'onTwitchAuthError');
      component.twitchApi = {
        _accessToken: null,
        init: vi.fn().mockResolvedValue({error: true})
      };
      try {
        await component.onMount();
      } catch (error) {
        expect(error.error).toBeTruthy();
        expect(component.onTwitchAuthError).toHaveBeenCalled();
        expect(component.onTwitchAuthInit).not.toHaveBeenCalled();
      }
    });
  });

  describe('onTwitchAuthInit', () => {
    test('should handle response with user info', () => {
      const component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'setState');
      const props = {
        setChannelInfo: vi.fn(),
        setUserInfo: vi.fn(),
      };
      component.props = props;
      component.twitchApi = {
        userInfo: {
          login: 'mockUsername',
          id: 'mockUserId',
          profile_image_url: 'mockProfileImageUrl',
        }
      };

      component.onTwitchAuthInit();
      expect(props.setUserInfo).toHaveBeenCalledTimes(1);
      expect(props.setChannelInfo).toHaveBeenCalledTimes(1);
      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState).toHaveBeenCalledWith({
        username: 'mockUsername',
        user_id: 'mockUserId',
        profile_image_url: 'mockProfileImageUrl',
        auth_pending: false,
        failed_login: false,
      }, component.updateModsAndVIPs);
    });

    test('should handle response with no user info', () => {
      let component = new AuthenticatedAppComponent();
      component.twitchApi._userInfo = {};
      vi.spyOn(component, 'setState');

      component.onTwitchAuthInit();

      expect(component.setState).toHaveBeenCalledWith({
        auth_pending: false,
        failed_login: true,
      }, expect.any(Function));
    });
  });

  describe('onTwitchAuthError', () => {
    test('should set state with failed login', () => {
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'setState');

      component.onTwitchAuthError();
      expect(component.setState).toHaveBeenCalledWith({
        auth_pending: false,
        failed_login: true,
      }, expect.any(Function));
    });
  });

  describe('logOut', () => {
    const {location} = window;

    beforeAll(() => {
      delete window.location;
      window.location = {reload: vi.fn()};
    });

    afterAll(() => {
      window.location = location;
    });
    test('should log out of api and update has_logged_out state', async() => {
      vi.spyOn(window.localStorage, 'removeItem');
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'setState');
      component.twitchApi = {
        logOut: vi.fn().mockResolvedValue({})
      };
      await component.logOut();

      expect(window.localStorage.removeItem).toHaveBeenCalled();
      expect(component.setState).toHaveBeenCalled();
    });
    test('should handle error and update has_logged_out state', async() => {
      vi.spyOn(window.localStorage, 'removeItem');
      let component = new AuthenticatedAppComponent();
      vi.spyOn(component, 'setState');
      component.twitchApi = {
        logOut: vi.fn().mockRejectedValue({})
      };
      await component.logOut();

      expect(component.setState).toHaveBeenCalled();
      expect(window.localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('updateModeratedChannels', () => {
    test('should update the moderated channels state in the store', async() => {
      const props = {
        setModeratedChannels: vi.fn()
      };
      const twitchApi = {
        requestModeratedChannels: vi.fn().mockResolvedValue({
          data: [{}],
          pagination: []
        }),
        validateToken: vi.fn().mockResolvedValue({}),
      };
      const component = new AuthenticatedAppComponent(props);
      component.state.user_id = '23456789';
      component.twitchApi = twitchApi;
      await component.updateModeratedChannels();

      expect(twitchApi.requestModeratedChannels).toHaveBeenCalled();
      expect(props.setModeratedChannels).toHaveBeenCalled();
    });
  });

  describe('updateModsAndVIPs', () => {
    test('should update the moderators, vips, and moderated channels states in the store', async() => {
      const props = {
        setModeratedChannels: vi.fn().mockImplementation(()=>{}),
        setModerators: vi.fn().mockImplementation(()=>{}),
        setVIPs: vi.fn().mockImplementation(()=>{}),
      };
      const twitchApi = {
        requestModeratedChannels: vi.fn().mockResolvedValue({
          data: [{}],
          pagination: []
        }),
        requestModerators: vi.fn().mockResolvedValue({
          data: [{}],
          pagination: []
        }),
        requestAllModerators: vi.fn().mockResolvedValue([]),
        requestVIPs: vi.fn().mockResolvedValue({
          data: [{}],
          pagination: []
        }),
        validateToken: vi.fn().mockResolvedValue({})
      };
      let component = new AuthenticatedAppComponent(props);
      component.state.user_id = '23456789';
      component.twitchApi = twitchApi;

      await component.updateModsAndVIPs();

      expect(component.twitchApi.validateToken).toHaveBeenCalled();
      expect(props.setModeratedChannels).toHaveBeenCalled();
      expect(props.setModerators).toHaveBeenCalled();
      expect(props.setVIPs).toHaveBeenCalled();
    });
  });


  describe('updateModerators', () => {
    test('should update the moderators state in the store', async() => {
      const props = {
        setModerators: vi.fn(),
        twitchApi: {
          requestModerators: vi.fn().mockResolvedValue({
            data: [],
            pagination: []
          }),
          requestAllModerators: vi.fn().mockResolvedValue([])
        }
      };

      const component = new AuthenticatedAppComponent(props);
      component.state.user_id = '23456789';
      component.twitchApi = {
        requestModerators: vi.fn().mockResolvedValue({
          data: [],
          pagination: []
        }),
        requestAllModerators: vi.fn().mockResolvedValue([])
      };
      await component.updateModerators();

      expect(component.twitchApi.requestAllModerators).toHaveBeenCalled();
      expect(props.setModerators).toHaveBeenCalled();
    });
  });

  describe('updateVIPs', () => {
    test('should update the vips state in the store', async() => {
      const props = {
        setVIPs: vi.fn(),
        twitchApi: {
          requestVIPs: vi.fn().mockResolvedValue({
            data: [],
            pagination: []
          })
        }
      };

      const component = new AuthenticatedAppComponent(props);
      component.state.user_id = '23456789';
      component.twitchApi = {
        requestVIPs: vi.fn().mockResolvedValue({
          data: [],
          pagination: []
        })
      };
      await component.updateVIPs();

      expect(component.twitchApi.requestVIPs).toHaveBeenCalled();
      expect(props.setVIPs).toHaveBeenCalled();
    });
  });


  describe('render', () => {
    let store;
    let twitchApi;

    beforeEach(() => {
      store = getStoreWithState(storeState);
      twitchApi = getMockTwitchApi();
      vi.useFakeTimers({ toFake: ['clearImmediate', 'clearTimeout', 'queueMicrotask', 'setImmediate', 'setTimeout'] });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    test('Should render with LoadingRipple', () => {
      const {container} = render(
        <Provider store={store}>
          <AuthenticatedApp twitchApi={twitchApi} />
        </Provider>
      );
      expect(container).toMatchSnapshot();
    });

    test('Should render MainScreen', () => {
      mockWindowLocation('http://localhost:5173/#?code=mock_code&scope=mock_scope');
      vi.spyOn(Date, 'now').mockReturnValue(499162860000);
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        switch (label) {
        case '__access_token':
          return 'MOCK TOKEN';
        case '__username':
          return 'TwitchUser';
        case '__user_id':
          return '23456789';
        default:
          return undefined;
        }
      });
      vi.spyOn(window.localStorage, 'setItem');
      vi.spyOn(TWITCH_API, 'requestAuthentication').mockResolvedValue({status: 204});
      vi.spyOn(TWITCH_API, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      vi.spyOn(TWITCH_API, 'requestUsers').mockResolvedValue({status: 204, data: [{login: 'username', id: 0}]});
      // vi.spyOn(TWITCH_API, '_authErrorCallback').mockResolvedValue(void 0);
      // vi.spyOn(TWITCH_API, '_onInitCallback').mockResolvedValue(void 0);
      vi.spyOn(TWITCH_API, 'initChatClient').mockResolvedValue(void 0);
      vi.spyOn(TWITCH_API, '_chatClient', 'get').mockReturnValue({
        connect: vi.fn(),
        say: vi.fn()
      });

      const {container} = render(
        <Provider store={store}>
          <AuthenticatedApp {...props} />
        </Provider>
      );
      vi.advanceTimersByTime(100);
      expect(container).toMatchSnapshot();

      expect(screen.getByTestId('MainScreenMock')).toBeInTheDocument();

      // expect(TWITCH_API.requestAuthentication).toHaveBeenCalledTimes(1);
      expect(TWITCH_API.validateToken).toHaveBeenCalledTimes(0);
      expect(TWITCH_API.requestUsers).toHaveBeenCalledTimes(0);
      expect(TWITCH_API.initChatClient).toHaveBeenCalledTimes(0);
      // expect(TWITCH_API.requestAuthentication).toHaveBeenCalledTimes(1);
    });

    test('Should render Landing', () => {

      class AuthenticatedAppLanding extends AuthenticatedAppComponent {
        UNSAFE_componentWillMount() {
          this._isMounted = true;
          return this.setState({
            auth_pending: false,
            failed_login: true,
          }, () => Promise.resolve());
        }
      }

      mockWindowLocation('http://localhost:5173/#?code=mock_code&scope=mock_scope');
      vi.spyOn(Date, 'now').mockReturnValue(499162860000);
      vi.spyOn(window.localStorage, 'getItem').mockImplementation((label) => {
        switch (label) {
        case '__access_token':
          return 'MOCK TOKEN';
        case '__username':
          return 'TwitchUser';
        case '__user_id':
          return '23456789';
        default:
          return undefined;
        }
      });
      vi.spyOn(window.localStorage, 'setItem');
      vi.spyOn(TWITCH_API, 'requestAuthentication').mockResolvedValue({status: 204});
      vi.spyOn(TWITCH_API, 'validateToken').mockResolvedValue({status: 204, login: 'username'});
      vi.spyOn(TWITCH_API, 'requestUsers').mockResolvedValue({status: 204, data: [{login: 'username', id: 0}]});
      // vi.spyOn(TWITCH_API, '_authErrorCallback').mockResolvedValue(void 0);
      // vi.spyOn(TWITCH_API, '_onInitCallback').mockResolvedValue(void 0);
      vi.spyOn(TWITCH_API, 'initChatClient').mockResolvedValue(void 0);
      vi.spyOn(TWITCH_API, '_chatClient', 'get').mockReturnValue({
        connect: vi.fn(),
        say: vi.fn()
      });

      const {container} = render(
        <Provider store={store}>
          <AuthenticatedAppLanding {...props} />
        </Provider>
      );
      vi.advanceTimersByTime(100);
      expect(container).toMatchInlineSnapshot(`
        <div>
          <div
            data-testid="LandingMock"
          >
            Landing
          </div>
        </div>
      `);

      // expect(container.type).toBe(Landing);
      expect(screen.getByTestId('LandingMock')).toBeInTheDocument();

      // expect(TWITCH_API.requestAuthentication).toHaveBeenCalledTimes(1);
      expect(TWITCH_API.validateToken).toHaveBeenCalledTimes(0);
      expect(TWITCH_API.requestUsers).toHaveBeenCalledTimes(0);
      expect(TWITCH_API.initChatClient).toHaveBeenCalledTimes(0);
      // expect(TWITCH_API.requestAuthentication).toHaveBeenCalledTimes(1);
    });

  });
});
