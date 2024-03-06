/* eslint-disable testing-library/render-result-naming-convention */
/* eslint-env jest */
import {AuthenticatedApp} from '@/pages/authenticated-app';
import {createRenderer} from 'react-test-renderer/shallow';
import fetch from 'node-fetch';
// import MainScreen from '../landing/MainScreen';
import React from 'react';
import {Navigate} from 'react-router-dom';
import {vi} from 'vitest';

// vi.mock('../landing/MainScreen');
vi.mock('node-fetch');
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
    router: {
      location: {
        pathname: '/',
        search: '?code=foobar&scope=chat:read chat:edit moderation:read whispers:edit',
        hash: ''
      },
    },
    match: {
      path: '/',
      url: '/',
      isExact: true,
      params: {}
    }
  };

  describe('componentDidMount', () => {
    test('should call getAuth when no access_token set in state', () => {
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'getAuth').mockResolvedValue(null);

      component.componentDidMount();
      expect(component.getAuth).toHaveBeenCalledTimes(1);
    });
    test('should call getUsers when access_token found in state', () => {
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'getUsers').mockResolvedValue(null);
      component.state.access_token = 'vroom-vroom-lewmon-crew';

      component.componentDidMount();

      expect(component.getUsers).toHaveBeenCalledTimes(1);
    });
    test('should call getAuth when an error is caught from getUsers', async() => {
      let component = new AuthenticatedApp();
      vi.spyOn(component, 'getAuth').mockResolvedValue(null);
      vi.spyOn(component, 'getUsers').mockRejectedValue('error stub');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      component.state.access_token = 'vroom-vroom-lewmon-crew';

      await component.componentDidMount();

      expect(component.getUsers).toHaveBeenCalledTimes(1);
      expect(component.getAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAuth', () => {
    const props = {
      router: {
        location: {
          search: 'code=54vabs9d2sd1f08pk4bjmwyjpx3iju&scope=chat%3Aread+chat%3Aedit+moderation%3Aread+whispers%3Aedit'
        }},
    };
    test.skip('should call setState and getUsers', async() => {
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
      fetch.mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({
            access_token: 'vroom-vroom-lewmon-crew'
          }),
        });
      });
      let component = new AuthenticatedApp(props);
      vi.spyOn(component, 'getUsers').mockResolvedValue(true);
      vi.spyOn(component, 'setState').mockImplementation(() => {});
      component._isMounted = true;
      component.props = props;

      await component.getAuth();

      expect(window.localStorage.__proto__.removeItem).toHaveBeenCalledTimes(8);
      expect(component.getUsers).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls).toMatchSnapshot();
    });
    test('should log events if passed and only call setState if no token returned', async() => {
      vi.spyOn(console, 'error');
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
      fetch.mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      });
      let component = new AuthenticatedApp(props);
      vi.spyOn(component, 'setState').mockImplementation(() => {});
      component._isMounted = true;
      component.props = props;

      await component.getAuth('error stub');

      expect(console.error).toHaveBeenCalledWith('error stub');
      expect(window.localStorage.__proto__.removeItem).toHaveBeenCalledTimes(8);
      expect(component.setState).toHaveBeenCalledWith({
        failed_login: true
      });
    });
    test('should catch any fetch errors and call setState', async() => {
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
      fetch.mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.reject({}),
        });
      });
      let component = new AuthenticatedApp(props);
      vi.spyOn(component, 'setState').mockImplementation(() => {});
      component._isMounted = true;
      component.props = props;

      await component.getAuth();

      expect(window.localStorage.__proto__.removeItem).toHaveBeenCalledTimes(8);
      expect(component.setState).toHaveBeenCalledWith({
        failed_login: true
      });
    });

    test('should not call setState if not mounted', async() => {
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
      fetch.mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      }).mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.reject({}),
        });
      });
      let component = new AuthenticatedApp(props);
      vi.spyOn(component, 'setState').mockImplementation(() => {});
      component.props = props;

      await component.getAuth();
      await component.getAuth();

      expect(window.localStorage.__proto__.removeItem).toHaveBeenCalledTimes(16);
      expect(component.setState).toHaveBeenCalledTimes(0);
    });
  });

  describe('promisedSetState', () => {
    const props = {
      router: {
        location: {
          search: 'code=54vabs9d2sd1f08pk4bjmwyjpx3iju&scope=chat%3Aread+chat%3Aedit+moderation%3Aread+whispers%3Aedit'
        }
      },
    };
    test('should call setState with expected values', async() => {
      let component = new AuthenticatedApp(props);

      vi.spyOn(component, 'setState').mockImplementation(( obj, cb=()=>{} ) => cb());

      await component.promisedSetState({ username: 'sirfarewell' });

      expect(component.setState).toHaveBeenCalledWith(
        { username: 'sirfarewell' },
        expect.any(Function) // anonymous function
      );

    });
  });

  describe.skip('getUsers', () => {
    const props = {
      router: {
        location: {
          search: 'code=54vabs9d2sd1f08pk4bjmwyjpx3iju&scope=chat%3Aread+chat%3Aedit+moderation%3Aread+whispers%3Aedit'
        }},
    };
    test('should call setState with broadcaster and list of mods', async() => {
      vi.spyOn(window.localStorage.__proto__, 'setItem');
      fetch.mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.resolve({
            data: [{
              id: '123456789',
              login: 'sirfarewell'
            }]
          }),
        });
      }).mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.resolve({
            data: [{
              broadcaster_type: '',
              created_at: '2019-11-18T00:47:34Z',
              display_name: 'SirFarewell',
              id: '123456789',
              login: 'sirfarewell'
            }, {
              user_name: 'HerooftheSprites'
            }],
            pagination: {}
          }),
        });
      });


      let component = new AuthenticatedApp(props);
      vi.spyOn(component, 'promisedSetState').mockResolvedValue();
      component._isMounted = true;
      component.props = props;

      await component.getUsers();


      expect(window.localStorage.__proto__.setItem).toHaveBeenCalledTimes(2);
      expect(component.promisedSetState).toHaveBeenCalledWith({
        username: 'sirfarewell',
        user_id: '123456789',
        modList: ['heroofthesprites']
      });
    });
    test('should not call promisedSetState if not mounted', async() => {
      vi.spyOn(window.localStorage.__proto__, 'setItem');
      fetch.mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.resolve({
            data: [{
              id: '123456789',
              login: 'sirfarewell'
            }]
          }),
        });
      }).mockImplementationOnce(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      });


      let component = new AuthenticatedApp(props);
      vi.spyOn(component, 'promisedSetState').mockImplementation(() => {});
      component.props = props;

      await component.getUsers();

      expect(window.localStorage.__proto__.setItem).toHaveBeenCalledTimes(2);
      expect(component.promisedSetState).toHaveBeenCalledTimes(0);
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
    test('should log out of api and reload window', async() => {
      vi.spyOn(window.localStorage.__proto__, 'removeItem');
      fetch.mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({}),
        });
      });
      let component = new AuthenticatedApp();
      await component.logOut();

      expect(window.localStorage.__proto__.removeItem).toHaveBeenCalledTimes(8);
      // expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('render', () => {
    test('should render with MainScreen', () => {
      const shallowRenderer = createRenderer();
      shallowRenderer.render(<AuthenticatedApp {...props} />);
      let instance = shallowRenderer.getMountedInstance();
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
