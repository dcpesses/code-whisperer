/* eslint-env jest */
import { render } from '@testing-library/react';
import {vi} from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { getStoreWithState } from '@/app/store';
import MessageHandler from '@/features/twitch-messages/message-handler';
import MainScreen, {MainScreen as MainScreenComponent, noop} from './index';

vi.mock('@/api/twitch');
vi.mock('../../../package.json', () => {
  return {
    ...vi.importActual('../../../package.json'),
    version: '0.0.0'
  };
});

const getMockTwitchApi = (overrides={}) => Object.assign({
  isChatConnected: true,
  _chatClient: {},
  onMessage: vi.fn(),
  sendMessage: vi.fn().mockResolvedValue([]),
  updateLastMessageTime: vi.fn(),
}, overrides);

const getMessageHandlerConfig = (overrides={}) => Object.assign({
  access_token: 'mockAccessToken',
  addGameRequest: vi.fn(),
  allowGameRequests: true,
  // changeNextGameIdx: this.changeNextGameIdx,
  channel: 'mockBroadcaster',
  clearQueueHandler: vi.fn(),
  closeQueueHandler: vi.fn(),
  joinQueueHandler: vi.fn(),
  listQueueHandler: vi.fn(),
  logUserMessages: false,
  messages: {},
  moderators: [],
  onDelete: vi.fn(),
  onMessageCallback: vi.fn(),
  onSettingsUpdate: vi.fn(),
  openQueueHandler: vi.fn(),
  playerExitHandler: vi.fn(),
  // previousGames: this.state.history.slice(0, this.state.nextGameIdx),
  removeSelectedGameFromHistory: vi.fn(),
  setNextGame: vi.fn(),
  settings: {},
  startGame: vi.fn(),
  toggleAllowGameRequests: vi.fn(),
  twitchApi: vi.fn().mockReturnValue(getMockTwitchApi()),
  upcomingGames: [],
  debug: false,
  init: false,
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


describe('MainScreen', () => {

  describe('constructor', () => {
    test('should load and initialize settings from localStorage', () => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(JSON.stringify({customDelimiter: true}));
      const mainScreen = new MainScreenComponent({});
      expect(mainScreen.state.settings).toMatchInlineSnapshot(`
        {
          "customDelimiter": true,
          "enableRoomCode": true,
        }
      `);
    });
    test('should initialize settings without any saved data from localStorage', () => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(undefined);
      const mainScreen = new MainScreenComponent({});
      expect(mainScreen.state.settings).toMatchInlineSnapshot(`
        {
          "enableRoomCode": true,
        }
      `);
    });
    test('should handle any errors that occur when initializing settings and use the default settings', () => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('{]');
      // vi.spyOn(JSON, 'parse').mockReturnValue()
      const mainScreen = new MainScreenComponent({});
      expect(mainScreen.state.settings).toMatchInlineSnapshot(`
        {
          "enableRoomCode": true,
        }
      `);
    });
  });

  describe('componentDidMount', () => {
    let mainScreen;

    beforeEach(() => {
      mainScreen = new MainScreenComponent({
        setFakeUserStates: vi.fn(),
        setFakeChannelStates: vi.fn(),
        setFakeSettingsStates: vi.fn(),
      });
      vi.spyOn(mainScreen, 'initMessageHandler');
    });

    test('should initialize messageHandler if TwitchApi is available', () => {
      mainScreen.props = {
        twitchApi: {
          isChatConnected: true
        }
      };
      mainScreen.componentDidMount();
      expect(mainScreen.initMessageHandler).toHaveBeenCalled();
    });

    test('should not initialize messageHandler if twitchApi is not available', () => {
      mainScreen.props = {
        twitchApi: null
      };
      mainScreen.initMessageHandler = vi.fn();
      mainScreen.componentDidMount();
      expect(mainScreen.initMessageHandler).not.toHaveBeenCalled();
    });

    test('should load fake state data', () => {
      vi.spyOn(window.location, 'hash', 'get').mockReturnValue('?fakestate=true');
      vi.spyOn(mainScreen, 'setState');

      mainScreen.componentDidMount();
      expect(mainScreen.setState).toHaveBeenCalled();
      expect(mainScreen.props.setFakeUserStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeChannelStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeSettingsStates).toHaveBeenCalled();
    });

  });

  describe('componentDidUpdate', () => {
    let mainScreen;

    beforeEach(() => {
      mainScreen = new MainScreenComponent({});
      vi.spyOn(mainScreen, 'initMessageHandler').mockReturnValue({});
      vi.spyOn(mainScreen, 'updateMessageHandler').mockReturnValue(null);
    });

    test('should initialize messageHandler when chat client connection changes', () => {
      mainScreen.messageHandler = new MessageHandler(getMessageHandlerConfig());
      mainScreen.props = {
        twitchApi: {
          isChatConnected: true
        }
      };
      const prevProps = {
        twitchApi: {
          isChatConnected: false
        }
      };
      mainScreen.componentDidUpdate(prevProps, {});
      expect(mainScreen.initMessageHandler).toHaveBeenCalled();
      expect(mainScreen.updateMessageHandler).not.toHaveBeenCalled();
    });

    test('should initialize messageHandler when chat client is connected but messageHandler not yet set', () => {
      mainScreen.messageHandler = null;
      mainScreen.props = {
        twitchApi: {
          isChatConnected: true
        }
      };
      const prevProps = {
        twitchApi: {
          isChatConnected: true
        }
      };
      mainScreen.componentDidUpdate(prevProps, {});
      expect(mainScreen.initMessageHandler).toHaveBeenCalled();
      expect(mainScreen.updateMessageHandler).not.toHaveBeenCalled();
    });

    test('should update messageHandler when chat client is connected and does not change AND remove any custom commands when unset', () => {
      mainScreen.messageHandler = {
        updateChatCommandTerm: vi.fn()
      };
      mainScreen.props = {
        settings: {
          customJoinCommand: null,
          customLeaveCommand: null,
        },
        twitchApi: {
          isChatConnected: true
        }
      };

      const prevProps = {
        settings: {
          customJoinCommand: '!joinme',
          customLeaveCommand: '!leaveme',
        },
        twitchApi: {
          isChatConnected: true
        }
      };

      mainScreen.componentDidUpdate(prevProps);
      expect(mainScreen.updateMessageHandler).toHaveBeenCalled();
      expect(mainScreen.messageHandler.updateChatCommandTerm).toHaveBeenCalledTimes(2);
      expect(mainScreen.initMessageHandler).not.toHaveBeenCalled();
    });
    test('should not update messageHandler if messageHandler does not exist and chat client not yet connected', () => {
      mainScreen.props = {
        twitchApi: {
          isChatConnected: false
        }
      };
      const prevProps = {
        twitchApi: {
          isChatConnected: false
        }
      };
      mainScreen.componentDidUpdate(prevProps);
      expect(mainScreen.initMessageHandler).not.toHaveBeenCalled();
      expect(mainScreen.updateMessageHandler).not.toHaveBeenCalled();
    });

    test('should not update messageHandler if twitchApi is not available', () => {
      mainScreen.props = {
        twitchApi: null
      };
      const prevProps = {};
      mainScreen.componentDidUpdate(prevProps);
      expect(mainScreen.initMessageHandler).not.toHaveBeenCalled();
      expect(mainScreen.updateMessageHandler).not.toHaveBeenCalled();
    });
  });

  describe('initMessageHandler', () => {
    let mainScreen;

    beforeEach(() => {
      mainScreen = new MainScreenComponent({});
    });

    test('should return null if twitchApi is not available', () => {
      mainScreen.props = { twitchApi: null };
      const messageHandler = mainScreen.initMessageHandler();
      expect(messageHandler).toBe(null);
    });

    test('should initialize messageHandler correctly if twitchApi is available', () => {
      mainScreen.props = {
        settings: {
          customJoinCommand: '!joinme',
          customLeaveCommand: '!leaveme',
        },
        twitchApi: getMockTwitchApi()
      };
      const messageHandler = mainScreen.initMessageHandler();
      expect(messageHandler).toBeTruthy();
    });
  });

  describe('updateMessageHandler', () => {
    let mainScreen;

    beforeEach(() => {
      mainScreen = new MainScreenComponent({
        twitchApi: getMockTwitchApi()
      });
    });
    test('should update messageHandler if both messageHandler and TwitchApi available', () => {
      vi.spyOn(mainScreen, 'initMessageHandler');
      mainScreen.props.access_token = 'mockUpdatedAccessToken';
      mainScreen.props.channel = 'TwitchChannel';
      mainScreen.state.logUserMessages = true;
      mainScreen.state.messages = { 'gameObj-longName': {} };
      mainScreen.props.moderators = { player1: {id: '11'} };
      mainScreen.props.settings = {
        customJoinCommand: '!joinme',
        customLeaveCommand: '!leaveme',
      };
      expect(mainScreen.updateMessageHandler()).toBeNull();
      expect(mainScreen.initMessageHandler).toHaveBeenCalledTimes(0);
    });
    test('should call initMessageHandler and return if chat client is connected but only accessible via props.twitchApi', () => {
      vi.spyOn(mainScreen, 'initMessageHandler');
      mainScreen.props.twitchApi = getMockTwitchApi();
      mainScreen.twitchApi = { isChatConnected: false };
      expect(mainScreen.updateMessageHandler({ twitchApi: getMockTwitchApi() })).toBeUndefined();
      expect(mainScreen.initMessageHandler).toHaveBeenCalledTimes(1);
    });
    test('should call initMessageHandler and return if chat client is not connected', () => {
      vi.spyOn(mainScreen, 'initMessageHandler');
      mainScreen.messageHandler = null;
      mainScreen.props.twitchApi = {};
      mainScreen.twitchApi = {};
      expect(mainScreen.updateMessageHandler()).toBeUndefined();
      expect(mainScreen.initMessageHandler).toHaveBeenCalledTimes(0);
    });

  });

  describe('onMessageHandlerInit', () => {
    let mainScreen;
    let messageHandler;

    beforeEach(() => {
      messageHandler = new MessageHandler(getMessageHandlerConfig());
      mainScreen = new MainScreenComponent({
        messageHandler,
        twitchApi: getMockTwitchApi()
      });
      mainScreen.messageHandler = messageHandler;
    });

    test('should update chat command terms if settings are updated', () => {
      mainScreen.props = {
        settings: {
          customJoinCommand: '!customJoin',
          customLeaveCommand: '!customLeave'
        }
      };
      vi.spyOn(messageHandler, 'updateChatCommandTerm');

      mainScreen.onMessageHandlerInit();

      expect(messageHandler.updateChatCommandTerm).toHaveBeenCalledTimes(2);
      expect(messageHandler.updateChatCommandTerm).toHaveBeenCalledWith('joinQueue', '!customJoin');
      expect(messageHandler.updateChatCommandTerm).toHaveBeenCalledWith('leaveQueue', '!customLeave');
    });

    test('should not update chat command terms if settings are not updated', () => {
      mainScreen.props = { settings: null };
      vi.spyOn(mainScreen.messageHandler, 'updateChatCommandTerm');

      mainScreen.onMessageHandlerInit();

      expect(messageHandler.updateChatCommandTerm).not.toHaveBeenCalled();
    });

    test('should return if messageHandler is not set', () => {
      mainScreen.messageHandler = null;

      expect(mainScreen.onMessageHandlerInit()).toBeUndefined();
    });
  });

  describe('getOptionsDebugMenu', () => {
    let mainScreen;
    let optionsDebugMenu;

    beforeEach(() => {
      mainScreen = new MainScreenComponent({
        setFakeQueueStates: vi.fn(),
        setFakeUserStates: vi.fn(),
        setFakeChannelStates: vi.fn(),
      });
      vi.spyOn(mainScreen, 'setState').mockImplementation((state, callbackFn) => {
        typeof state === 'function' && state({}); callbackFn && callbackFn();
      });
      optionsDebugMenu = mainScreen.getOptionsDebugMenu();
    });
    test('should be defined', () => {
      expect(optionsDebugMenu).toBeDefined();
      expect(optionsDebugMenu.every(item => !!item.label && !!item.onClick)).toBeTruthy();
    });
    test('should load mock game requests', () => {
      let menuItem = optionsDebugMenu.find(item => item.label === 'Load Mock Game Requests');
      expect(menuItem).toBeDefined();
      expect(menuItem.onClick()).not.toBeDefined();
      expect(mainScreen.setState).toHaveBeenCalled();
    });
    test('should load mock game and player requests', () => {
      let menuItem = optionsDebugMenu.find(item => item.label === 'Load Mock Game & Player Requests');
      expect(menuItem).toBeDefined();
      expect(menuItem.onClick()).not.toBeDefined();
      expect(mainScreen.props.setFakeQueueStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeUserStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeChannelStates).toHaveBeenCalled();
      expect(mainScreen.setState).toHaveBeenCalled();
    });
    test('should log the debug environment', () => {
      let menuItem = optionsDebugMenu.find(item => item.label === 'Log Debug Environment');
      expect(menuItem).toBeDefined();
      expect(menuItem.onClick()).not.toBeDefined();
    });
    test('should toggle the user message logging', () => {
      let menuItem = optionsDebugMenu.find(item => item.label === 'Toggle User Message Logging');
      expect(menuItem).toBeDefined();
      expect(menuItem.onClick()).not.toBeDefined();
      expect(mainScreen.setState).toHaveBeenCalled();
    });
  });

  describe('onMessage', () => {
    let mainScreen;
    let props;

    beforeEach(() => {
      props = {
        userLookup: {},
        setUserLookup: vi.fn(),
        setChatterInfo: vi.fn(),
        twitchApi: getMockTwitchApi({
          updateLastMessageTime: vi.fn(),
          requestUserInfo: vi.fn().mockResolvedValue({ data: [{ login: 'testUser' }] })
        })
      };
      mainScreen = new MainScreenComponent(props);
      mainScreen.twitchApi = props.twitchApi;
    });

    test('should update user lookup and chatter info when user metadata is provided', async() => {
      const message = 'Hello!';
      const user = 'testUser';
      const metadata = { 'user-id': '123' };
      await mainScreen.onMessage(message, user, metadata);
      expect(mainScreen.props.setUserLookup).toHaveBeenCalledWith(metadata);
      expect(mainScreen.props.setChatterInfo).toHaveBeenCalledWith({ login: 'testUser' });
    });

    test('should not update user lookup and chatter info when user metadata is not provided', async() => {
      const message = 'Hello!';
      const user = 'testUser';
      await mainScreen.onMessage(message, user);
      expect(mainScreen.props.setUserLookup).not.toHaveBeenCalled();
      expect(mainScreen.props.setChatterInfo).not.toHaveBeenCalled();
    });
  });

  describe('onSettingsUpdate', () => {
    let mainScreen;

    beforeEach(() => {
      vi.spyOn(window.localStorage.__proto__, 'setItem');
      mainScreen = new MainScreenComponent({});
      mainScreen.updateMessageHandler = vi.fn();
      mainScreen.props.updateAppSettings = vi.fn();
    });

    test('should update settings in state, save to localStorage, and call updateMessageHandler', () => {
      const nextSettings = { enableRoomCode: false };
      // mainScreen.setState = vi.fn();
      vi.spyOn(mainScreen, 'setState').mockImplementation((state, callbackFn)=>{callbackFn();});
      mainScreen.onSettingsUpdate(nextSettings);
      expect(mainScreen.setState).toHaveBeenCalledWith({ settings: nextSettings }, expect.any(Function));
      expect(localStorage.setItem).toHaveBeenCalledWith('__settings', JSON.stringify(nextSettings));
      expect(mainScreen.updateMessageHandler).toHaveBeenCalled();
    });
  });

  describe('toggleChangelogModal', () => {
    test('should toggle the state of showChangelogModal', () => {
      const mainScreen = new MainScreenComponent({});
      vi.spyOn(mainScreen, 'setState');
      mainScreen.state.showChangelogModal = false;
      mainScreen.toggleChangelogModal();
      expect(mainScreen.setState.mock.calls[0][0](mainScreen.state)).toEqual({ showChangelogModal: true });
    });
  });

  describe('toggleOptionsMenu', () => {
    test('should toggle the state of toggleOptionsMenu', () => {
      const mainScreen = new MainScreenComponent({});
      vi.spyOn(mainScreen, 'setState');
      mainScreen.state.showOptionsMenu = false;
      mainScreen.toggleOptionsMenu();
      expect(mainScreen.setState.mock.calls[0][0](mainScreen.state)).toEqual({ showOptionsMenu: true });
    });
  });

  describe('sendWhisper', () => {
    let mainScreen;
    let props;

    beforeEach(() => {
      props = {
        setWhisperStatus: vi.fn(),
        twitchApi: {
          sendWhisper: vi.fn().mockResolvedValue()
        }
      };
      mainScreen = new MainScreenComponent(props);
    });

    test('should call sendWhisper method and update whisper status when TwitchApi is available', async() => {
      const player = { username: 'testUser' };
      const msg = '!join';
      await mainScreen.sendWhisper(player, msg);
      expect(mainScreen.props.twitchApi.sendWhisper).toHaveBeenCalledWith(player, msg);
      expect(mainScreen.props.setWhisperStatus).toHaveBeenCalledWith({ login: player.username, response: undefined });
    });

    test('should handle cases when twitchApi.sendWhisper is not available', async() => {
      mainScreen.twitchApi = null;
      const player = { username: 'testUser' };
      const msg = '!join';
      const resp = await mainScreen.sendWhisper(player, msg);
      expect(resp).toBeUndefined();
    });
  });


  describe('render', () => {
    let store;
    let twitchApi;
    beforeEach(() => {
      store = getStoreWithState(storeState);
      twitchApi = getMockTwitchApi();
    });
    test('Should render without error', () => {
      const {container} = render(
        <Provider store={store}>
          <MainScreen twitchApi={twitchApi} />
        </Provider>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
