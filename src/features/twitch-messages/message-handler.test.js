/* eslint-env jest */
import {vi} from 'vitest';
import MessageHandler, { DefaultChatCommands, noop } from './message-handler';

vi.mock('../../../package.json', () => {
  return {
    ...vi.importActual('../../../package.json'),
    version: '0.0.0'
  };
});
global.fetch = vi.fn();
vi.mock('tmi.js');
vi.mock('@/api/twitch');

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
  debug: false,
  init: false,
}, overrides);


describe('DefaultChatCommands', () => {
  test('should be defined', () => {
    expect(DefaultChatCommands).toBeDefined();
  });
  describe('listCommands', () => {
    test('should return list of commands', () => {
      const scope = {
        chatCommands: DefaultChatCommands,
        sendMessage: vi.fn()
      };
      expect(DefaultChatCommands.find(c => c.id === 'listCommands').response(scope)).toBeTruthy();
      expect(scope.sendMessage.mock.calls).toMatchSnapshot();
    });
  });
  describe('listVersion', () => {
    test('should return the version of the app', () => {
      const scope = {sendMessage: vi.fn()};
      expect(DefaultChatCommands.find(c => c.id === 'listVersion').response(scope)).toBeTruthy();
      expect(scope.sendMessage).toBeCalledWith(
        expect.stringContaining('v0.0.0'),
      );
    });
  });
  describe('whichPack', () => {
    test('should call sendMessage with the party pack of the known game', () => {
      const scope = {
        findGame: vi.fn().mockReturnValue({
          name: 'formalGameName',
          longName: 'formalGameName (partyPackName)',
          partyPack: 'partyPackName',
        }),
        sendMessage: vi.fn()
      };
      expect(DefaultChatCommands.find(c => c.id === 'whichPack').response(scope, 'username', '!whichpack formalGameName')).toBeTruthy();
      expect(scope.sendMessage).toBeCalledWith(
        expect.stringContaining('formalGameName is a partyPackName game'),
      );
    });
    test('should call sendMessage with the string returned from findGame', () => {
      const scope = {
        findGame: vi.fn().mockReturnValue('information about the specified game'),
        sendMessage: vi.fn()
      };
      expect(DefaultChatCommands.find(c => c.id === 'whichPack').response(scope, 'username', '!whichpack formalGameName')).toBeTruthy();
      expect(scope.sendMessage).toBeCalledWith(
        expect.stringContaining('information about the specified game'),
      );
    });
    test('should call sendMessage with a response on how to use the command', () => {
      const scope = {
        findGame: vi.fn().mockReturnValue({
          name: 'formalGameName',
          longName: 'formalGameName (partyPackName)',
          partyPack: 'partyPackName',
        }),
        sendMessage: vi.fn()
      };
      expect(DefaultChatCommands.find(c => c.id === 'whichPack').response(scope, 'username', '!whichpack ')).toBeTruthy();
      expect(scope.sendMessage).toBeCalledWith(
        expect.stringContaining('please specify the game'),
      );
    });
  });
  describe('joinQueue', () => {
    test('should call joinQueueHandler with the joining username', () => {
      const scope = {
        joinQueueHandler: vi.fn(),
        settings: {
          enableJoinConfirmationMessage: true
        }
      };
      expect(DefaultChatCommands.find(c => c.id === 'joinQueue').response(scope, 'username', '!join')).toBeTruthy();
      expect(scope.joinQueueHandler).toBeCalledWith(
        'username',
        {sendConfirmationMsg: true},
      );
    });
  });
  describe('leaveQueue', () => {
    test('should call playerExitHandler with departing username', () => {
      const scope = {
        playerExitHandler: vi.fn(),
        settings: {
          enableLeaveConfirmationMessage: true
        }
      };
      expect(DefaultChatCommands.find(c => c.id === 'leaveQueue').response(scope, 'username')).toBeTruthy();
      expect(scope.playerExitHandler).toBeCalledWith(
        'username',
        {sendConfirmationMsg: true},
      );
    });
  });
  describe('addUser', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        joinQueueHandler: vi.fn(),
        sendMessage: vi.fn(),
      };
    });
    test('should add a user to the queue with a priority seat', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'addUser').response(scope, 'channelmod', '!adduser @mockplayer')).toBeTruthy();
      expect(scope.joinQueueHandler).toBeCalledWith('mockplayer', {
        sendConfirmationMsg: true,
        isPrioritySeat: true
      });
    });
    test('should not add anyone if no user is specified', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'addUser').response(scope, 'channelmod', '!adduser ')).toBeTruthy();
      expect(scope.joinQueueHandler).not.toBeCalled();
    });
    test('should not add anyone if user is not a mod', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'addUser').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.joinQueueHandler).not.toBeCalled();
    });
  });
  describe('removeUser', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        playerExitHandler: vi.fn(),
        sendMessage: vi.fn(),
      };
    });
    test('should remove a user from the queue', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'removeUser').response(scope, 'channelmod', '!removeuser @mockplayer')).toBeTruthy();
      expect(scope.playerExitHandler).toBeCalledWith('mockplayer');
    });
    test('should not remove anyone if no user is specified', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'removeUser').response(scope, 'channelmod', '!removeuser ')).toBeTruthy();
      expect(scope.playerExitHandler).not.toBeCalled();
    });
    test('should not remove anyone if user is not a mod', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'removeUser').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.playerExitHandler).not.toBeCalled();
    });
  });
  describe('listCommands', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        listQueueHandler: vi.fn().mockReturnValue(['dcpesses', 'dewinblack', 'rxpcgal70']),
        sendMessage: vi.fn(),
        settings: {
          customDelimiter: false
        },
      };
    });
    test('should return list of players in the Playing queue', () => {
      expect(DefaultChatCommands.find(c => c.id === 'listQueue').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.sendMessage.mock.calls).toMatchSnapshot();
    });
    test('should return list of players in the Playing queue separated by a custom delimiter', () => {
      scope.settings.customDelimiter = '#';
      expect(DefaultChatCommands.find(c => c.id === 'listQueue').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.sendMessage.mock.calls).toMatchSnapshot();
    });
    test('should not return list of players in the Playing queue when user is not a mod', () => {
      scope.settings.enableRestrictedListQueue = true;
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'listQueue').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.sendMessage.mock.calls).toMatchSnapshot();
    });
  });
  describe('clear', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        clearQueueHandler: vi.fn(),
      };
    });
    test('should clear all users from the queue', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'clear').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.clearQueueHandler).toBeCalled();
    });
    test('should not clear queue if user is not a mod', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'clear').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.clearQueueHandler).not.toBeCalled();
    });
  });
  describe('open', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        openQueueHandler: vi.fn(),
      };
    });
    test('should open the Interested queue to all users', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'open').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.openQueueHandler).toBeCalled();
    });
    test('should not open the Interested queue if user is not a mod', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'open').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.openQueueHandler).not.toBeCalled();
    });
  });
  describe('close', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        closeQueueHandler: vi.fn(),
      };
    });
    test('should close the Interested queue to all users', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'close').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.closeQueueHandler).toBeCalled();
    });
    test('should not close the Interested queue if user is not a mod', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'close').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.closeQueueHandler).not.toBeCalled();
    });
  });
  describe('clearopen', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        clearQueueHandler: vi.fn(),
        openQueueHandler: vi.fn(),
      };
    });
    test('should clear all users from the queues and reopens the Interested queue', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'clearopen').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.clearQueueHandler).toBeCalled();
      expect(scope.openQueueHandler).toBeCalled();
    });
    test('should not clear any users or reopen the Interested queue if user is not a mod', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'clearopen').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.clearQueueHandler).not.toBeCalled();
      expect(scope.openQueueHandler).not.toBeCalled();
    });
  });
  describe('startgame', () => {
    let scope;
    beforeEach(() => {
      scope = {
        isModOrBroadcaster: vi.fn().mockReturnValue(true),
        // startGame: vi.fn(),
        clearQueueHandler: vi.fn(),
        openQueueHandler: vi.fn(),
        sendMessage: vi.fn(),
      };
    });
    test('should clear all users from the queues and call sendMessage when startGame returns true', () => {
      scope.startGame = vi.fn().mockReturnValue(true);
      expect(DefaultChatCommands.find(c => c.id === 'startgame').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.clearQueueHandler).toBeCalled();
      expect(scope.openQueueHandler).toBeCalled();
      expect(scope.sendMessage).toBeCalledWith(
        expect.stringContaining('the game has been started'),
      );
    });
    test('should clear all users from the queues and call sendMessage when startGame returns false', () => {
      scope.startGame = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'startgame').response(scope, 'channelmod')).toBeTruthy();
      expect(scope.clearQueueHandler).toBeCalled();
      expect(scope.openQueueHandler).toBeCalled();
      expect(scope.sendMessage).toBeCalledWith(
        expect.stringContaining('the game was already started'),
      );
    });
    test('should not clear any users or reopen the Interested queue if user is not a mod', () => {
      scope.isModOrBroadcaster = vi.fn().mockReturnValue(false);
      expect(DefaultChatCommands.find(c => c.id === 'startgame').response(scope, 'nonchannelmod')).toBeTruthy();
      expect(scope.clearQueueHandler).not.toBeCalled();
      expect(scope.openQueueHandler).not.toBeCalled();
      expect(scope.sendMessage).toBeCalledWith(
        expect.stringContaining('only channel moderators can use this command'),
      );
    });
  });
});

describe('MessageHandler', () => {
  let messageHandler;
  let props;
  let twitchApi;

  /*const upcomingGames = [
    {
      'name': 'Split the Room',
      'longName': 'Split the Room (Party Pack 5)',
      'partyPack': 'Party Pack 5',
      'Min players': 3,
      'Max players': 8,
      'Variants': [
        'split the room',
        'splittheroom',
        'split room',
        'room split',
        'split',
        'str'
      ],
      'username': 'dcpesses',
      'time': 1628114989864,
      'locked': false,
      'chosen': false,
      'override': false
    },
    {
      'name': 'Fibbage 3',
      'longName': 'Fibbage 3 (Party Pack 4)',
      'partyPack': 'Party Pack 4',
      'Min players': 2,
      'Max players': 8,
      'Variants': [
        'fibbage 3',
        'fibbage3'
      ],
      'username': 'dcpesses',
      'time': 1628114666823,
      'locked': false,
      'chosen': true,
      'override': false
    },
    {
      'name': "You Don't Know Jack",
      'longName': "You Don't Know Jack (Party Pack 5)",
      'partyPack': 'Party Pack 5',
      'Min players': 1,
      'Max players': 8,
      'Variants': [
        'ydkj 2',
        'ydkj fs',
        'ydkjfs',
        'you dont know jack 2',
        "you don't know jack 2",
        "you don't know jack full stream",
        "you don't know jack full steam",
        "you don't know jack: full stream"
      ],
      'username': 'dcpesses',
      'time': 1628114634007,
      'locked': false,
      'chosen': false
    }
  ];*/

  /*const validGames = {
    'Any Version': {
      'Quiplash': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'quiplash',
          'quip',
          'ql'
        ]
      },
      'Trivia Murder Party': {
        'Min players': 1,
        'Max players': 8,
        'Variants': [
          'tmp',
          'trivia murder party'
        ]
      },
      'Fibbage': {
        'Min players': 2,
        'Max players': 8,
        'Variants': [
          'fibbage'
        ]
      },
      "You Don't Know Jack": {
        'Min players': 1,
        'Max players': 8,
        'Variants': [
          'ydkj',
          'you dont know jack',
          "you don't know jack"
        ]
      },
      'Drawful': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'drawful',
          'drawfull',
          'draw full'
        ]
      }
    },
    'Party Pack 4': {
      'Fibbage: Enough About You': {
        'Min players': 2,
        'Max players': 8,
        'Variants': [
          'eay',
          'enough about you',
          'feay',
          'fibbage eay',
          'fibbage: eay',
          'fibbage enough about you',
          'fibbage: enough about you'
        ]
      },
      'Fibbage 3': {
        'Min players': 2,
        'Max players': 8,
        'Variants': [
          'fibbage 3',
          'fibbage3'
        ]
      },
      'Survive The Internet': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'survive',
          'survive the internet',
          'sti'
        ]
      },
    },
    'Party Pack 6': {
      'Trivia Murder Party 2': {
        'Min players': 1,
        'Max players': 8,
        'Variants': [
          'tmp2',
          'tmp 2',
          'trivia murder party 2'
        ]
      },
      'Push The Button': {
        'Min players': 4,
        'Max players': 10,
        'Variants': [
          'ptb',
          'push the b',
          'push the button',
          'push da button'
        ]
      },
      'Dictionarium': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'dictionarium',
          'dictionary'
        ]
      },
      'Role Models': {
        'Min players': 3,
        'Max players': 6,
        'Variants': [
          'role models',
          'roles models',
          'role model',
          'rolemodel',
          'rolemodels'
        ]
      },
      'Joke Boat': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'joke boat',
          'jokeboat'
        ]
      }
    },
    'Party Pack 7': {
      'Quiplash 3': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'ql3',
          'ql 3',
          'quip 3',
          'quip3',
          'quiplash 3',
          'quiplash3'
        ]
      },
      "Champ'd Up": {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'champd',
          'champed',
          'champd up',
          "champ'd",
          "champ'd up",
          'champed up'
        ]
      },
      "Blather 'Round": {
        'Min players': 2,
        'Max players': 6,
        'Variants': [
          'blather',
          'blather round',
          "blather 'round",
          'blatherround',
          'blatheround'
        ]
      },
      'Talking Points': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'talking points',
          'talkingpoints',
          'talk points'
        ]
      },
      'The Devils and the Details': {
        'Min players': 3,
        'Max players': 8,
        'Variants': [
          'devils',
          'devils in details',
          'devils and details',
          'devils & details',
          "devil's in details",
          "devil's and details",
          "devil's & details",
          'devils in the details',
          'devils and the details',
          'devils & the details',
          "devil's in the details",
          "devil's and the details",
          "devil's & the details",
          'the devils in the details',
          'the devils and the details',
          'the devils & the details',
          "the devil's in the details",
          "the devil's and the details",
          "the devil's & the details"
        ]
      }
    }
  };*/

  beforeEach(() => {
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
    vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');
    twitchApi = vi.fn().mockReturnValue({
      sendMessage: vi.fn().mockResolvedValue([])
    });
    props = {
      access_token: 'blahblahblahblahblah',
      channel: 'sirfarewell',
      moderators: [
        'asukii314',
        'dcpesses'
      ],
      messages: {
        'Trivia Murder Party 2 (Party Pack 6)': {
          name: 'Trivia Murder Party 2',
          isSubRequest: false,
          longName: 'Trivia Murder Party 2 (Party Pack 6)',
          partyPack: 'Party Pack 6',
          Variants: [
            'tmp2',
            'tmp 2',
            'trivia murder party 2'
          ],
          'Min players': 3,
          'Max players': 8,
          username: 'aurora88877',
          locked: false
        },
        'Quiplash 3 (Party Pack 7)': {
          name: 'Quiplash 3',
          isSubRequest: false,
          longName: 'Quiplash 3 (Party Pack 7)',
          partyPack: 'Party Pack 7',
          'Min players': 3,
          'Max players': 8,
          Variants: [
            'ql3',
            'ql 3',
            'quip 3',
            'quip3',
            'quiplash 3',
            'quiplash3'
          ],
          username: 'johnell75',
          locked: false
        },
        'Survive The Internet (Party Pack 4)': {
          name: 'Survive The Internet',
          isSubRequest: false,
          longName: 'Survive The Internet (Party Pack 4)',
          partyPack: 'Party Pack 4',
          'Min players': 3,
          'Max players': 8,
          Variants: ['survive', 'survive the internet', 'sti'],
          username: 'dcpesses',
          time: 1627509347466,
          locked: true,
          chosen: false
        }
      },
      allowGameRequests: true,
      twitchApi
    };
    messageHandler = new MessageHandler(getMessageHandlerConfig());
  });

  afterEach(()=>{
    messageHandler = null;
    vi.unstubAllEnvs();
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      vi.spyOn(global.console, 'log').mockImplementation(()=>{});
      const messageHandler = new MessageHandler({init: false});
      expect(messageHandler.access_token).toBeUndefined();
      // expect(messageHandler.addGameRequest).toBe(noop);
      // expect(messageHandler.allowGameRequests).toBeUndefined();
      // expect(messageHandler.changeNextGameIdx).toBeUndefined();
      expect(messageHandler.channel).toBeUndefined();
      expect(messageHandler.clearQueueHandler).toBe(noop);
      expect(messageHandler.closeQueueHandler).toBe(noop);
      expect(messageHandler.debug).toBeFalsy();
      expect(messageHandler.joinQueueHandler).toBe(noop);
      expect(messageHandler.logUserMessages).toBeUndefined();
      expect(messageHandler.listQueueHandler).toBe(noop);
      expect(messageHandler._onInitCallback).toBe(noop);
      expect(messageHandler._isInit).toBeFalsy();
      // expect(messageHandler.messages).toBeUndefined();
      expect(messageHandler.moderators).toBeUndefined();
      expect(messageHandler.onDelete).toBe(noop);
      expect(messageHandler.onMessageCallback).toBe(noop);
      expect(messageHandler.openQueueHandler).toBe(noop);
      expect(messageHandler.playerExitHandler).toBe(noop);
      // expect(messageHandler.previousGames).toBeUndefined();
      // expect(messageHandler.removeSelectedGameFromHistory).toBe(noop);
      // expect(messageHandler.setNextGame).toBe(noop);
      expect(messageHandler.settings).toBeUndefined();
      // expect(messageHandler.onSettingsUpdate).toBe(noop);
      expect(messageHandler.startGame).toBe(noop);
      // expect(messageHandler.toggleAllowGameRequests).toBe(noop);
      expect(messageHandler.twitchApi).toBeUndefined();
      // expect(messageHandler.upcomingGames).toBeUndefined();
    });
    test('should initialize with passed parameters', () => {
      vi.spyOn(global.console, 'log').mockImplementation(()=>{});
      const mockCallback = vi.fn();
      const messageHandler = new MessageHandler({
        access_token: 'mockAccessToken',
        // addGameRequest: mockCallback,
        // allowGameRequests: true,
        // changeNextGameIdx: 0,
        channel: 'mockBroadcaster',
        clearQueueHandler: mockCallback,
        closeQueueHandler: mockCallback,
        joinQueueHandler: mockCallback,
        onInit: null,
        logUserMessages: false,
        messages: {},
        moderators: [],
        onDelete: mockCallback,
        onMessageCallback: mockCallback,
        // onSettingsUpdate: mockCallback,
        openQueueHandler: mockCallback,
        playerExitHandler: mockCallback,
        // previousGames: {},
        // removeSelectedGameFromHistory: mockCallback,
        // setNextGame: mockCallback,
        settings: {},
        startGame: mockCallback,
        // toggleAllowGameRequests: mockCallback,
        twitchApi: 'mockTwitchApi',
        // upcomingGames: [],
        debug: null,
        init: false,
      });
      expect(messageHandler.access_token).toBe('mockAccessToken');
      // expect(messageHandler.addGameRequest).toBe(mockCallback);
      // expect(messageHandler.allowGameRequests).toBeTruthy();
      // expect(messageHandler.changeNextGameIdx).toBe(0);
      expect(messageHandler.channel).toBe('mockBroadcaster');
      expect(messageHandler.clearQueueHandler).toBe(mockCallback);
      expect(messageHandler.closeQueueHandler).toBe(mockCallback);
      expect(messageHandler.joinQueueHandler).toBe(mockCallback);
      expect(messageHandler.logUserMessages).toBe(false);
      expect(messageHandler.debug).toBeFalsy();
      expect(messageHandler._onInitCallback).toBe(noop);
      expect(messageHandler._isInit).toBeFalsy();
      // expect(messageHandler.messages).toEqual({});
      expect(messageHandler.moderators).toEqual([]);
      expect(messageHandler.onDelete).toBe(mockCallback);
      expect(messageHandler.onMessageCallback).toBe(mockCallback);
      expect(messageHandler.openQueueHandler).toBe(mockCallback);
      expect(messageHandler.playerExitHandler).toBe(mockCallback);
      // expect(messageHandler.previousGames).toEqual({});
      // expect(messageHandler.removeSelectedGameFromHistory).toBe(mockCallback);
      // expect(messageHandler.setNextGame).toBe(mockCallback);
      expect(messageHandler.settings).toEqual({});
      // expect(messageHandler.onSettingsUpdate).toBe(mockCallback);
      expect(messageHandler.startGame).toBe(mockCallback);
      // expect(messageHandler.toggleAllowGameRequests).toBe(mockCallback);
      expect(messageHandler.twitchApi).toBe('mockTwitchApi');
      // expect(messageHandler.upcomingGames).toEqual([]);
    });

    test('should call init', async() => {
      const mockTwitchApi = {
        _chatClient: true,
        onMessage: null
      };
      const messageHandler = await new MessageHandler({
        twitchApi: mockTwitchApi,
        debug: false,
        init: true
      });
      expect(messageHandler.isInit).toBeTruthy();
    });
  });
  describe('init', () => {
    test('should run the predefined init callback function', () => {
      vi.spyOn(global.console, 'log').mockImplementation(()=>{});
      const onInitCallback = vi.fn();
      const messageHandler = new MessageHandler({init: false, debug: true, onInit: onInitCallback, twitchApi: {}});
      messageHandler.init();
      expect(onInitCallback).toHaveBeenCalled();
    });
    test('should warn that no chat client is available when twitchApi not set', () => {
      vi.spyOn(global.window.console, 'warn').mockImplementation(()=>{});
      const onInitCallback = vi.fn();
      const messageHandler = new MessageHandler({init: false, onInit: onInitCallback});
      messageHandler.init();
      expect(onInitCallback).not.toHaveBeenCalled();
      // expect(global.window.console, 'warn').toHaveBeenCalled();
    });
  });
  describe('isModOrBroadcaster', () => {
    test('returns true only if the user is the channel host or mod', () => {
      messageHandler = new MessageHandler(getMessageHandlerConfig({
        channel: 'sirfarewell',
        moderators: [
          {user_id: '1234', user_login: 'dcpesses', 'user_name': 'dcpesses'},
          {user_id: '1234', user_login: 'mockmoduser', 'user_name': 'mockmoduser'},
        ]
      }));
      expect(messageHandler.isModOrBroadcaster('SirFarewell')).toBeTruthy();
      expect(messageHandler.isModOrBroadcaster('dcpesses')).toBeTruthy();
      expect(messageHandler.isModOrBroadcaster('mockModUser')).toBeTruthy();
      expect(messageHandler.isModOrBroadcaster('mrscootscoot')).toBeFalsy();
    });
  });
  describe('checkUserCommands', () => {
    let messageHandler;
    beforeEach(() => {
      vi.spyOn(global.console, 'log').mockImplementation(()=>{});
      messageHandler = new MessageHandler({
        init: false,
        debug: true,
        logUserMessages: false,
      });

      messageHandler.chatCommands = [{
        commands: ['!testcommand'],
        displayName: 'testcommands',
        description: 'This is only a test',
        id: 'testCommand',
        mod: false,
        response: vi.fn(),
      }];
    });
    test('should return true if the command specified was found and responded successfully', () => {
      messageHandler.chatCommands[0].response = vi.fn().mockReturnValue(true);
      expect(messageHandler.checkUserCommands('!testcommand', 'username')).toBeTruthy();
      expect(messageHandler.chatCommands[0].response).toHaveBeenCalled();
    });
    test('should return false if the command specified was found but did not respond successfully', () => {
      messageHandler.chatCommands[0].response = vi.fn().mockReturnValue(false);
      expect(messageHandler.checkUserCommands('!testcommand', 'username')).toBeFalsy();
      expect(messageHandler.chatCommands[0].response).toHaveBeenCalled();
    });
    test('should return undefined if the command specified was not found', () => {
      expect(messageHandler.checkUserCommands('!unknowncommand', 'username')).toBeUndefined();
      expect(messageHandler.chatCommands[0].response).not.toHaveBeenCalled();
    });
  });
  describe('findGame', () => {
    const easterEggRequests = [
      {
        RequestName: 'Jackbox Party Pack 8',
        Response: 'Jackbox Party Pack 8 games are not available to play yet! Please come back after it\'s released on October 14th.',
        Variants: [
          'jackbox party pack 8',
          'job job'
        ]
      }, {
        RequestName: 'Goose',
        Response: 'please don\'t taunt the wheel. FrankerZ',
        Variants: [
          'goose'
        ]
      }, {
        RequestName: 'Affection',
        Response: () => {
          return 'there there, it\'s going to be okay. VirtualHug  <3 ';
        },
        Variants: [
          'affection'
        ]
      }
    ];
    test('should handle string requests', () => {
      messageHandler = new MessageHandler(props);

      vi.spyOn(messageHandler, 'sendMessage').mockImplementation(()=>{});

      messageHandler.findGame('goose', 'username');
      expect(messageHandler.sendMessage).toBeCalledTimes(1);
      expect(messageHandler.sendMessage).toBeCalledWith(`/me @username ${easterEggRequests[1].Response}`);
    });
    test('should handle requests with function responses', () => {
      messageHandler = new MessageHandler(props);

      vi.spyOn(messageHandler, 'sendMessage').mockImplementation(()=>{});

      messageHandler.findGame('affection', 'username');
      expect(messageHandler.sendMessage).toBeCalledTimes(1);
      expect(messageHandler.sendMessage).toBeCalledWith(`/me @username ${easterEggRequests[2].Response()}`);
    });
    test('should handle existing games', () => {
      messageHandler = new MessageHandler(props);

      vi.spyOn(messageHandler, 'sendMessage').mockImplementation(()=>{});

      expect(messageHandler.findGame('tmp2', 'username')).toMatchInlineSnapshot(`
        {
          "Max players": 8,
          "Min players": 1,
          "Variants": [
            "tmp2",
            "tmp 2",
            "trivia murder party 2",
          ],
          "longName": "Trivia Murder Party 2 (Party Pack 6)",
          "name": "Trivia Murder Party 2",
          "partyPack": "Party Pack 6",
        }
      `);
      expect(messageHandler.sendMessage).toBeCalledTimes(0);
    });
    test('should handle existing requests', () => {
      messageHandler = new MessageHandler(props);

      vi.spyOn(messageHandler, 'sendMessage').mockImplementation(()=>{});

      messageHandler.findGame('i am bread', 'username');
      expect(messageHandler.sendMessage).toBeCalledTimes(1);
      expect(messageHandler.sendMessage).toBeCalledWith(
        expect.stringContaining('could not be found in the list'),
      );
    });
  });
  describe('checkForGameCommand', () => {
    let messageHandler;
    test('returns if no valid game request command is detected', () => {
      messageHandler = new MessageHandler(props);

      vi.spyOn(messageHandler, 'findGame').mockReturnValue(true);
      vi.spyOn(messageHandler, 'sendMessage').mockImplementation(()=>{});

      expect(messageHandler.checkForGameCommand('!reeq tmp2', 'tttonypepperoni')).toBeUndefined();

      expect(messageHandler.sendMessage).not.toHaveBeenCalled();
      expect(messageHandler.findGame).not.toHaveBeenCalled();
    });
    test('calls sendMessage when no game is specified and returns', () => {
      messageHandler = new MessageHandler(props);
      vi.spyOn(messageHandler, 'sendMessage').mockImplementation(()=>{});

      expect(messageHandler.checkForGameCommand('!request', 'arsonimp')).toBeNull();
      expect(messageHandler.sendMessage.mock.calls[0][0]).toEqual(
        expect.stringContaining('/me @arsonimp, please specify the game'),
      );
    });
    test('calls & returns findGame when a game is specified', () => {
      messageHandler = new MessageHandler(props);
      vi.spyOn(messageHandler, 'findGame').mockReturnValue(true);

      expect(messageHandler.checkForGameCommand('!request tmp2 ', 'cactus_dad')).toBeTruthy();
      expect(messageHandler.findGame).toHaveBeenCalledWith('tmp2', 'cactus_dad');
    });
  });
  describe('onMessage', () => {
    const target = 'dcpesses';
    const tags = {
      'badge-info': null,
      'badge-info-raw': null,
      'badges': {
        broadcaster: '1'
      },
      'badges-raw': 'broadcaster/1',
      'client-nonce': 'd406c6013cdc662d4a4726fe55c25943',
      'color': '#1E90FF',
      'display-name': 'dcpesses',
      'emotes': null,
      'emotes-raw': null,
      'flags': null,
      'id': 'dea09d13-50d8-4eec-9729-6299c988bf1e',
      'message-type': 'chat',
      'mod': false,
      'room-id': '473294395',
      'subscriber': false,
      'tmi-sent-ts': '1628284838590',
      'turbo': false,
      'user-id': '473294395',
      'user-type': null,
      'username': target
    };
    beforeEach(() => {
      messageHandler = new MessageHandler({
        ...props,
        onMessageCallback: vi.fn(),
        addGameRequest: vi.fn(),
        onDelete: vi.fn(),
        sendMessage: vi.fn(),
        debug: false,
        // upcomingGames
      });
      // messageHandler.validGames = validGames;
      vi.spyOn(messageHandler, 'sendMessage').mockImplementation(()=>{});
      messageHandler.logUserMessages = false;
    });
    test('should handle known user commands without error', () => {
      expect(messageHandler.onMessage(target, tags, '!version', false)).toBeUndefined();

      expect(messageHandler.sendMessage.mock.calls[0][0]).toEqual(
        expect.stringContaining('v0.0.0'),
      );
    });
    test('should handle unknown user commands without error', () => {
      expect(messageHandler.onMessage(target, tags, '!foo', false)).toBeUndefined();

      expect(messageHandler.sendMessage).toHaveBeenCalledTimes(0);
    });
    test('should call console.log and ignore messages from self', () => {
      vi.spyOn(global.console, 'log').mockImplementation(()=>{});
      messageHandler.logUserMessages = true;
      messageHandler.onMessage(target, tags, '!version', true);

      expect(global.console.log).toHaveBeenCalled();
      expect(messageHandler.sendMessage).not.toHaveBeenCalled();
    });
    test('should ignore messages from self', () => {
      messageHandler.onMessage(target, tags, '!version', true);

      expect(messageHandler.sendMessage).toHaveBeenCalledTimes(0);
    });
  });
  describe('sendMessage', () => {
    test('calls twitchApi.sendMessage using the passed message', async() => {
      messageHandler.twitchApi = {
        sendMessage: vi.fn()
      };

      await messageHandler.sendMessage('This is a dummy message.');

      expect(messageHandler.twitchApi.sendMessage).toHaveBeenCalledTimes(1);
      expect(messageHandler.twitchApi.sendMessage).toHaveBeenCalledWith('This is a dummy message.');
    });
  });
  describe('updateChatCommandTerm', () => {
    test('should return true when a chat command is successfully updated', () => {
      expect(messageHandler.updateChatCommandTerm('listCommands', '!newcommand')).toBeTruthy();
    });

    test('should return false when a chat command is not found', () => {
      expect(messageHandler.updateChatCommandTerm('unknownCommand', '!unknown')).toBeFalsy();
    });

    test('should return false when no key is given', () => {
      expect(messageHandler.updateChatCommandTerm()).toBeFalsy();
    });
  });
  describe('updateChatCommand', () => {
    test('should return true when a chat command permission is successfully updated', () => {
      expect(messageHandler.updateChatCommand('listCommands', 'mod', true)).toBeTruthy();
    });

    test('should return false when the option is not found in the chat command', () => {
      expect(messageHandler.updateChatCommand('listCommands', 'unknownOption', true)).toBeFalsy();
    });

    test('should return false when no id is given', () => {
      expect(messageHandler.updateChatCommand()).toBeFalsy();
    });
  });
});

