/* eslint-env jest */
import { render } from '@testing-library/react';
import {vi} from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { getStoreWithState } from '@/app/store';
import { LOCALSETTINGS_KEY } from '@/features/twitch/settings-slice';
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

const mockLSGetItem = (key) => {
  switch (key) {
  case LOCALSETTINGS_KEY:
    return JSON.stringify({customDelimiter: '|'});
  case '__version':
    return '1.0.0';
  default:
    return null;
  }
};

describe('noop', () => {
  test('should execute without error', () => {
    expect(noop()).toBeUndefined();
  });
});


describe('MainScreen', () => {

  describe('constructor', () => {
    let updateAppSettings;

    beforeEach(() => {
      updateAppSettings = vi.fn();
    });

    test('should load and initialize settings from localStorage', () => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(mockLSGetItem);
      const mainScreen = new MainScreenComponent({updateAppSettings});
      expect(updateAppSettings).toBeCalledWith({
        'customDelimiter': '|',
        'enableRoomCode': true,
      });
      expect(mainScreen).toBeDefined();
    });
    test('should handle any errors that occur when initializing settings and use the default settings', () => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('{]');
      const mainScreen = new MainScreenComponent({updateAppSettings});
      expect(updateAppSettings).not.toHaveBeenCalled();
      expect(mainScreen).toBeDefined();
    });
  });

  describe('componentDidMount', () => {
    let mainScreen;

    beforeEach(() => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(mockLSGetItem);
      mainScreen = new MainScreenComponent({
        setFakeUserStates: vi.fn(),
        setFakeChannelStates: vi.fn(),
        setFakeSettingsStates: vi.fn(),
        showOnboarding: vi.fn(),
        updateAppSettings: vi.fn(),
      });
      vi.spyOn(mainScreen, 'initMessageHandler');
    });

    test('should initialize messageHandler if TwitchApi is available', () => {
      mainScreen.props.twitchApi = {
        isChatConnected: true
      };
      mainScreen.componentDidMount();
      expect(mainScreen.initMessageHandler).toHaveBeenCalled();
    });

    test('should not initialize messageHandler if twitchApi is not available', () => {
      mainScreen.props.twitchApi = null;
      mainScreen.initMessageHandler = vi.fn();
      mainScreen.componentDidMount();
      expect(mainScreen.initMessageHandler).not.toHaveBeenCalled();
    });

    test('should load fake state data', () => {
      vi.spyOn(window.location, 'hash', 'get').mockReturnValue('?fakestate=true');

      mainScreen.componentDidMount();
      expect(mainScreen.props.setFakeUserStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeChannelStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeSettingsStates).toHaveBeenCalled();
    });

    test('should show onboarding prompt modal for first time user', () => {
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(
        (key) => {
          switch (key) {
          case LOCALSETTINGS_KEY:
            return JSON.stringify({customDelimiter: true});
          default:
            return null;
          }
        }
      );
      mainScreen = new MainScreenComponent({
        setFakeUserStates: vi.fn(),
        setFakeChannelStates: vi.fn(),
        setFakeSettingsStates: vi.fn(),
        showOnboarding: vi.fn(),
        updateAppSettings: vi.fn(),
      });
      vi.spyOn(mainScreen, 'initMessageHandler');
      mainScreen.componentDidMount();
      expect(mainScreen.state.showOnboardingPromptModal).toBeTruthy();
      // expect(mainScreen.props.showOnboarding).toHaveBeenCalled();
    });

    test('should not show onboarding for past users', () => {
      mainScreen.componentDidMount();
      expect(mainScreen.state.showOnboardingPromptModal).toBeFalsy();
      // expect(mainScreen.props.showOnboarding).not.toHaveBeenCalled();
    });
  });

  describe('componentDidUpdate', () => {
    let mainScreen;

    beforeEach(() => {
      mainScreen = new MainScreenComponent({
        updateAppSettings: vi.fn(),
      });
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
          customQueueCommand: null,
        },
        twitchApi: {
          isChatConnected: true
        }
      };

      const prevProps = {
        settings: {
          customJoinCommand: '!joinme',
          customLeaveCommand: '!leaveme',
          customQueueCommand: '!queueme',
        },
        twitchApi: {
          isChatConnected: true
        }
      };

      mainScreen.componentDidUpdate(prevProps);
      expect(mainScreen.updateMessageHandler).toHaveBeenCalled();
      expect(mainScreen.messageHandler.updateChatCommandTerm).toHaveBeenCalledTimes(3);
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
      mainScreen = new MainScreenComponent({
        updateAppSettings: vi.fn(),
      });
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
          customQueueCommand: '!queueme',
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
        twitchApi: getMockTwitchApi(),
        updateAppSettings: vi.fn(),
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
        customQueueCommand: '!queueme',
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
        twitchApi: getMockTwitchApi(),
        updateAppSettings: vi.fn(),
      });
      mainScreen.messageHandler = messageHandler;
    });

    test('should update chat command terms if settings are updated', () => {
      mainScreen.props = {
        settings: {
          customJoinCommand: '!customJoin',
          customLeaveCommand: '!customLeave',
          customQueueCommand: '!customQueue',
          enableRestrictedListQueue: true
        }
      };
      vi.spyOn(messageHandler, 'updateChatCommandTerm'); // TODO: migrate all to updateChatCommand
      vi.spyOn(messageHandler, 'updateChatCommand');

      mainScreen.onMessageHandlerInit();

      expect(messageHandler.updateChatCommandTerm).toHaveBeenCalledTimes(3);
      expect(messageHandler.updateChatCommandTerm).toHaveBeenCalledWith('joinQueue', '!customJoin');
      expect(messageHandler.updateChatCommandTerm).toHaveBeenCalledWith('leaveQueue', '!customLeave');
      expect(messageHandler.updateChatCommandTerm).toHaveBeenCalledWith('listQueue', '!customQueue');
      expect(messageHandler.updateChatCommand).toHaveBeenCalledTimes(4);
      expect(messageHandler.updateChatCommand).toHaveBeenCalledWith('joinQueue', 'commands', '!customJoin');
      expect(messageHandler.updateChatCommand).toHaveBeenCalledWith('leaveQueue', 'commands', '!customLeave');
      expect(messageHandler.updateChatCommand).toHaveBeenCalledWith('listQueue', 'commands', '!customQueue');
      expect(messageHandler.updateChatCommand).toHaveBeenCalledWith('listQueue', 'mod', true);

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
        updateAppSettings: vi.fn(),
      });
      optionsDebugMenu = mainScreen.getOptionsDebugMenu();
    });
    test('should be defined', () => {
      expect(optionsDebugMenu).toBeDefined();
      expect(optionsDebugMenu.every(item => !!item.label && !!item.onClick)).toBeTruthy();
    });
    test('should load mock player requests', () => {
      let menuItem = optionsDebugMenu.find(item => item.label === 'Load Mock Player Requests');
      expect(menuItem).toBeDefined();
      expect(menuItem.onClick()).not.toBeDefined();
      expect(mainScreen.props.setFakeQueueStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeUserStates).toHaveBeenCalled();
      expect(mainScreen.props.setFakeChannelStates).toHaveBeenCalled();
    });
    test('should log the debug environment', () => {
      let menuItem = optionsDebugMenu.find(item => item.label === 'Log Debug Environment');
      expect(menuItem).toBeDefined();
      expect(menuItem.onClick()).not.toBeDefined();
    });
    test('should toggle the user message logging', () => {
      vi.spyOn(mainScreen, 'toggleUserMessageLogging');
      let menuItem = optionsDebugMenu.find(item => item.label === 'Toggle User Message Logging');
      expect(menuItem).toBeDefined();
      expect(menuItem.onClick()).not.toBeDefined();
      expect(mainScreen.toggleUserMessageLogging).toHaveBeenCalled();
    });
  });

  describe('toggleUserMessageLogging', () => {
    test('should toggle the state of logUserMessages', () => {
      const mainScreen = new MainScreenComponent({
        updateAppSettings: vi.fn(),
      });
      vi.spyOn(mainScreen, 'setState');
      mainScreen.state.logUserMessages = false;
      mainScreen.toggleUserMessageLogging();
      expect(mainScreen.setState.mock.calls[0][0](mainScreen.state)).toEqual({ logUserMessages: true });
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
        }),
        updateAppSettings: vi.fn(),
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
      mainScreen = new MainScreenComponent({
        updateAppSettings: vi.fn(),
      });
      mainScreen.updateMessageHandler = vi.fn();
      mainScreen.props.updateAppSettings = vi.fn();
    });

    test('should update settings in state, save to localStorage, and call updateMessageHandler', () => {
      const nextSettings = { enableRoomCode: false };

      mainScreen.onSettingsUpdate(nextSettings);

      expect(localStorage.setItem).toHaveBeenCalledWith('__settings', JSON.stringify(nextSettings));
      expect(mainScreen.props.updateAppSettings).toHaveBeenCalled();
      expect(mainScreen.updateMessageHandler).toHaveBeenCalled();
    });
  });

  describe('onShowOnboarding', () => {
    test('should hide modal and show onboarding walkthrough', () => {
      const mainScreen = new MainScreenComponent({
        showOnboarding: vi.fn(),
        updateAppSettings: vi.fn(),
      });
      mainScreen.state.showOnboardingPromptModal = true;
      vi.spyOn(mainScreen, 'setState');
      mainScreen.onShowOnboarding();
      expect(mainScreen.props.showOnboarding).toHaveBeenCalled();
      expect(mainScreen.setState.mock.calls[0][0](mainScreen.state)).toEqual({ showOnboardingPromptModal: false });
    });
  });

  describe('toggleChangelogModal', () => {
    test('should toggle the state of showChangelogModal', () => {
      const mainScreen = new MainScreenComponent({
        updateAppSettings: vi.fn(),
      });
      vi.spyOn(mainScreen, 'setState');
      mainScreen.state.showChangelogModal = false;
      mainScreen.toggleChangelogModal();
      expect(mainScreen.setState.mock.calls[0][0](mainScreen.state)).toEqual({ showChangelogModal: true });
    });
  });

  describe('toggleOptionsMenu', () => {
    test('should toggle the state of toggleOptionsMenu', () => {
      const mainScreen = new MainScreenComponent({
        updateAppSettings: vi.fn(),
      });
      vi.spyOn(mainScreen, 'setState');
      mainScreen.state.showOptionsMenu = false;
      mainScreen.toggleOptionsMenu();
      expect(mainScreen.setState.mock.calls[0][0](mainScreen.state)).toEqual({ showOptionsMenu: true });
    });
  });

  describe('toggleOnboardingPromptModal', () => {
    test('should toggle the state of showOnboardingPromptModal', () => {
      const mainScreen = new MainScreenComponent({
        updateAppSettings: vi.fn(),
      });
      vi.spyOn(mainScreen, 'setState');
      mainScreen.state.showOnboardingPromptModal = false;
      mainScreen.toggleOnboardingPromptModal();
      expect(mainScreen.setState.mock.calls[0][0](mainScreen.state)).toEqual({ showOnboardingPromptModal: true });
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
        },
        updateAppSettings: vi.fn(),
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
      twitchApi = getMockTwitchApi({
        isChatConnected: true,
        updateLastMessageTime: vi.fn(),
        requestUserInfo: vi.fn().mockResolvedValue({ data: [{ login: 'testUser' }] })
      });
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
