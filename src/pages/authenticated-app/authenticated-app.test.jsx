/* eslint-disable testing-library/render-result-naming-convention */
/* eslint-env jest */
import {AuthenticatedApp} from '@/pages/authenticated-app';
import {createRenderer} from 'react-test-renderer/shallow';
// import MainScreen from '../landing/MainScreen';
import React from 'react';
import {Navigate} from 'react-router-dom';
import {vi} from 'vitest';

// vi.mock('../landing/MainScreen');
vi.mock('react-router-dom', () => {
  const reactRouterDom = vi.importActual('react-router-dom');
  return {
    ...reactRouterDom,
    // eslint-disable-next-line react/display-name
    Navigate: () => () => (<div>React Tooltip Mock</div>),
    redirect: vi.fn()
  };
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
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'onDelayedMount').mockResolvedValue(null);

      component.componentDidMount();
      expect(component.onDelayedMount).toHaveBeenCalledTimes(1);
    });
  });

  describe('onMount', () => {
    test('should reuse existing access token from localStorage if available', async() => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('MOCK TOKEN');
      let component = new AuthenticatedApp();
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

    test('should initialize the Twitch API class and call onTwitchAuthInit when completed', async() => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(undefined);
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'onTwitchAuthInit');
      component.twitchApi = {
        _accessToken: null,
        init: vi.fn().mockResolvedValue({auth: true, users: true})
      };

      await component.onMount();
      expect(component.onTwitchAuthInit).toHaveBeenCalled();
    });
  });

  describe('onTwitchAuthInit', () => {
    test('should handle response with user info', () => {
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'setState');
      component.twitchApi = {
        userInfo: {
          login: 'mockUsername',
          id: 'mockUserId',
          profile_image_url: 'mockProfileImageUrl',
        }
      };

      component.onTwitchAuthInit();
      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState).toHaveBeenCalledWith({
        username: 'mockUsername',
        user_id: 'mockUserId',
        profile_image_url: 'mockProfileImageUrl',
        auth_pending: false,
        failed_login: false,
      });
    });

    test('should handle response with no user info', () => {
      let component = new AuthenticatedApp();
      component.twitchApi._userInfo = {};
      vi.spyOn(component, 'setState');

      component.onTwitchAuthInit();

      expect(component.setState).toHaveBeenCalledWith({
        auth_pending: false,
        failed_login: true,
      });
    });
  });

  describe('onTwitchAuthError', () => {
    test('should set state with failed login', () => {
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'setState');

      component.onTwitchAuthError();
      expect(component.setState).toHaveBeenCalledWith({
        auth_pending: false,
        failed_login: true,
      });
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
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'setState');
      component.twitchApi = {
        logOut: vi.fn().mockResolvedValue({})
      };
      await component.logOut();

      expect(window.localStorage.__proto__.removeItem).toHaveBeenCalled();
      expect(component.setState).toHaveBeenCalled();
    });
    test('should handle error and update has_logged_out state', async() => {
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'setState');
      component.twitchApi = {
        logOut: vi.fn().mockRejectedValue({})
      };
      await component.logOut();

      expect(component.setState).toHaveBeenCalled();
      expect(window.localStorage.__proto__.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('render', () => {
    test('should render with MainScreen', () => {
      const shallowRenderer = createRenderer();
      shallowRenderer.render(<AuthenticatedApp {...props} />);
      let instance = shallowRenderer.getMountedInstance();
      instance.twitchApi = {mock: 'TwitchApi'};
      instance.setState({
        access_token: 'yadayadayada',
        failed_login: false,
        modList: [],
        username: 'sirgoosewell'
      });
      let component = shallowRenderer.getRenderOutput();
      // expect(component.props.children.type).toBe(MainScreen);
      expect(component).toMatchSnapshot();
      shallowRenderer.unmount();
    });
    test('should render with Navigate on failed login', () => {
      const shallowRenderer = createRenderer();
      shallowRenderer.render(<AuthenticatedApp {...props} />);
      let instance = shallowRenderer.getMountedInstance();
      instance._isMounted = true;
      instance.setState({
        access_token: null,
        failed_login: true,
        username: null
      });
      let component = shallowRenderer.getRenderOutput();
      expect(component.type).toBe(Navigate);
      expect(component).toMatchSnapshot();
      shallowRenderer.unmount();
    });
    test('should render with Navigate on has_logged_out state', () => {
      const shallowRenderer = createRenderer();
      shallowRenderer.render(<AuthenticatedApp {...props} />);
      let instance = shallowRenderer.getMountedInstance();
      instance._isMounted = true;
      instance.setState({
        access_token: null,
        failed_login: false,
        has_logged_out: true,
        username: null
      });
      let component = shallowRenderer.getRenderOutput();
      expect(component.type).toBe(Navigate);
      expect(component).toMatchSnapshot();
      shallowRenderer.unmount();
    });
    test('should render with null', () => {
      const shallowRenderer = createRenderer();
      shallowRenderer.render(<AuthenticatedApp {...props} />);
      let instance = shallowRenderer.getMountedInstance();
      instance.setState({
        access_token: null,
        failed_login: false,
        username: null
      });
      let component = shallowRenderer.getRenderOutput();
      expect(component.props.children).toBeDefined();
      expect(component).toMatchSnapshot();
      shallowRenderer.unmount();
    });
  });
});
