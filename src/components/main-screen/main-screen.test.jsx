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
  onMessage: vi.fn()
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
  twitchApi: vi.fn().mockReturnValue({
    sendMessage: vi.fn().mockResolvedValue([])
  }),
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

  describe.skip('componentDidMount', () => {
    let mainScreen;

    beforeEach(() => {
      mainScreen = new MainScreenComponent({});
    });

    test('should initialize messageHandler if twitchApi is available and call initMessageHandler', () => {
      mainScreen.props = {
        twitchApi: {
          isChatConnected: true
        }
      };
      mainScreen.initMessageHandler = vi.fn();
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
        twitchApi: {
          isChatConnected: true
        }
      };
      const prevState = {
        settings: {
          customJoinCommand: '!joinme',
          customLeaveCommand: '!leaveme',
        }
      };

      mainScreen.state.settings = {
        customJoinCommand: null,
        customLeaveCommand: null,
      };
      mainScreen.componentDidUpdate(mainScreen.props, prevState);
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
      mainScreen.componentDidUpdate(prevProps, {});
      expect(mainScreen.initMessageHandler).not.toHaveBeenCalled();
      expect(mainScreen.updateMessageHandler).not.toHaveBeenCalled();
    });

    test('should not update messageHandler if twitchApi is not available', () => {
      mainScreen.props = {
        twitchApi: null
      };
      const prevProps = {};
      mainScreen.componentDidUpdate(prevProps, {});
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
      mainScreen.props = { twitchApi: getMockTwitchApi() };
      mainScreen.state.settings = {
        customJoinCommand: '!joinme',
        customLeaveCommand: '!leaveme',
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
      mainScreen.state.settings = {
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
      mainScreen.state = {
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
      mainScreen.state = { settings: null };
      vi.spyOn(mainScreen.messageHandler, 'updateChatCommandTerm');

      mainScreen.onMessageHandlerInit();

      expect(messageHandler.updateChatCommandTerm).not.toHaveBeenCalled();
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
      twitchApi = {
        debug: true
      };
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
