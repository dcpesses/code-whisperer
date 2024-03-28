import {resolveDuplicateCommands} from '@/utils';
import jsonJackboxGameList from './jackbox-games.json';
import {version} from '../../../package.json';

const REQUEST_COMMAND = '!request';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
/*
const ChatCommand = {
  commands: ['!command'],
  displayName: 'CommandName',
  description: 'Description of what this command does',
  mod: false, // true if command only available for mods & broadcaster
  response: (scope, username, message) => scope.sendMessage(`@${username} said "${message}" in chat!`) && true, // func, return bool on success
};


// For future TypeScript conversion
type chatResponseFunctionType = (scope: unknown, username: string, message: string) => boolean;
interface ChatCommand {
  commands: string[];
  displayName: string;
  description: string;
  mod: boolean;
  response: chatResponseFunctionType;
}
*/

export const chatCommands = {
  //========= general =========
  listCommands: {
    commands: ['!commands'],
    displayName: 'commands',
    description: 'Posts the version of the app and its url',
    mod: false,
    response: (scope) => {
      const commands = resolveDuplicateCommands(scope.chatCommands).map(v => v.commands.join(', ')).join(', ');
      scope.sendMessage(`Code Whisperer Commands: ${commands}`);
      return true;
    },
  },
  listVersion: {
    commands: ['!version'],
    displayName: 'version',
    description: 'Posts the version of the app and its url',
    mod: false,
    response: (scope) => {
      scope.sendMessage(`/me is using Game Code Whisperer, v${version} GoatEmotey https://github.com/dcpesses/code-whisperer`);
      return true;
    },
  },
  whichPack: {
    commands: ['!whichpack'],
    displayName: 'whichpack GAME',
    description: 'Replies with the Jackbox Party Pack of the specified game',
    mod: false,
    response: (scope, username, message) => {
      const requestedGame = message.replace('!whichpack', '').trim();
      if (requestedGame === '') {
        scope.sendMessage(`/me @${username}, please specify the game you would like to look up: e.g. !whichpack TMP 2`);
        return true;
      }

      const gameObj = scope.findGame(requestedGame, username);
      if (typeof gameObj === 'object') {
        scope.sendMessage(`/me @${username}, ${gameObj.name} is a ${gameObj.partyPack} game.`);
      }
      if (typeof gameObj === 'string') {
        scope.sendMessage(gameObj);
      }
      return true;
    },
  },

  //========= player management =========
  joinQueue: {
    commands: ['!join', '!new'],
    displayName: 'join',
    description: 'Adds the user to the Interested queue',
    mod: false,
    response: (scope, username, message) => {
      scope.joinQueueHandler(username, {
        sendConfirmationMsg: (message === '!join')
      });
      return true;
    },
  },
  leaveQueue: {
    commands: ['!leave'],
    displayName: 'leave',
    description: 'Removes the user from the Interested queue',
    mod: false,
    response: (scope, username) => {
      scope.playerExitHandler(username);
      return true;
    },
  },
  addUser: {
    commands: ['!adduser', '!redeemseat'],
    displayName: 'adduser',
    description: 'Adds the specified user directly to Playing queue',
    mod: true,
    response: (scope, username, message) => {
      if (!scope.isModOrBroadcaster(username)) {
        scope.sendMessage(`/me @${username}, only channel moderators can use this command.`);
        return true;
      }
      const redeemingUser = message.replace('!adduser', '').replace('!redeemseat', '').replace('@', '').trim();
      if (redeemingUser === '') {
        scope.sendMessage(`/me @${username}, please specify the user who has redeemed a priority seat in the next game: for example, ${message.startsWith('!a') ? '!adduser' : '!redeemseat'} @asukii314`);
        return true;
      }
      scope.joinQueueHandler(redeemingUser, {
        sendConfirmationMsg: true,
        isPrioritySeat: true
      });
      return true;
    },
  },
  removeUser: {
    commands: ['!removeuser'],
    displayName: 'removeuser',
    description: 'Removes the specified user from all queues',
    mod: true,
    response: (scope, username, message) => {
      if (!scope.isModOrBroadcaster(username)) {
        scope.sendMessage(`/me @${username}, only channel moderators can use this command.`);
        return true;
      }
      const exitingUser = message.replace('!removeuser', '').replace('@', '').trim();
      if (exitingUser === '') {
        scope.sendMessage(`/me @${username}, please specify the user who will be removed in the next game: for example, !removeuser @dewinblack`);
        return true;
      }
      scope.playerExitHandler(exitingUser);
      return true;
    },
  },

  //========= queue management =========
  clear: {
    commands: ['!clear'],
    displayName: 'clear',
    description: 'Removes all users from all of the queues',
    mod: true,
    response: (scope, username) => {
      if (scope.isModOrBroadcaster(username)) {
        scope.clearQueueHandler();
      }
      return true;
    },
  },
  open: {
    commands: ['!open'],
    displayName: 'open',
    description: 'Opens the Interested queue',
    mod: true,
    response: (scope, username) => {
      if (scope.isModOrBroadcaster(username)) {
        scope.openQueueHandler();
      }
      return true;
    },
  },
  close: {
    commands: ['!close'],
    displayName: 'close',
    description: 'Closes the Interested queue',
    mod: true,
    response: (scope, username) => {
      if (scope.isModOrBroadcaster(username)) {
        scope.closeQueueHandler();
      }
      return true;
    },
  },
  clearopen: {
    commands: ['!clearopen'],
    displayName: 'clearopen',
    description: 'Removes all users from the queues and reopens the Interested queue',
    mod: true,
    response: (scope, username) => {
      if (scope.isModOrBroadcaster(username)) {
        scope.clearQueueHandler();
        scope.openQueueHandler();
      }
      return true;
    },
  },
  startgame: {
    commands: ['!startgame'],
    displayName: 'startgame',
    description: 'Removes all users from the queues and resets additional things.',
    mod: true,
    response: (scope, username) => {
      if (!scope.isModOrBroadcaster(username)) {
        scope.sendMessage(`/me @${username}, only channel moderators can use this command.`);
        return true;
      }
      if (scope.startGame()) {
        scope.sendMessage(`/me @${username}, the game has been started.`);
      } else {
        scope.sendMessage(`/me @${username}, the game was already started.`);
      }
      return true;
    },
  },
};

export const easterEggRequests = [
  {
    RequestName: 'Version',
    Response: `is using Game Code Whisperer, v${version} GoatEmotey`,
    Variants: [
      'version',
      'v',
      'info'
    ]
  }, {
    RequestName: 'Affection',
    Response: () => 'there there, it\'s going to be okay. VirtualHug  <3 ',
    Variants: [
      'a friend',
      'a hug',
      'a kiss',
      'friend',
      'hug',
      'kiss',
      'affection',
      'a shoulder to cry on',
      'shoulder to cry on'
    ]
  }, {
    RequestName: 'Goose',
    Response: 'please don\'t taunt the wheel. FrankerZ',
    Variants: [
      'goose',
      'honk',
      'meow',
      'mrow',
      'woof',
      'bark',
      'nugs',
      'chicken nugs'
    ]
  }, {
    RequestName: 'Lewmon',
    Response: 'please don\'t taunt the app. sirfar3Lewmon sirfar3Lewmon sirfar3Lewmon',
    Variants: [
      'lewmon',
      'sirfar3lewmon'
    ]
  }, {
    RequestName: 'DoTheDew',
    Response: 'dewinbDTD dewinbDance dewinbGIR dewinbDance dewinbGIR dewinbDance dewinbDTD',
    Variants: [
      'dothedew',
      'dewinblack'
    ]
  }
];

export const noop = () => {};

export default class MessageHandler {
  constructor({
    access_token,
    addGameRequest=noop,
    allowGameRequests,
    joinQueueHandler=noop,
    changeNextGameIdx,
    channel,
    clearQueueHandler=noop,
    closeQueueHandler=noop,
    logUserMessages,
    messages,
    modList,
    onDelete=noop,
    onMessageCallback=noop,
    onSettingsUpdate=noop,
    openQueueHandler=noop,
    playerExitHandler=noop,
    previousGames,
    removeSelectedGameFromHistory=noop,
    setNextGame=noop,
    settings,
    startGame=noop,
    toggleAllowGameRequests=noop,
    twitchApi,
    upcomingGames,
    debug=false,
    init=true,
  }) {

    this.access_token = access_token;
    this.addGameRequest = addGameRequest;
    this.allowGameRequests = allowGameRequests;
    this.changeNextGameIdx = changeNextGameIdx;
    this.channel = channel;
    this.clearQueueHandler = clearQueueHandler;
    this.closeQueueHandler = closeQueueHandler;
    this.debug = debug ?? (!import.meta.env.PROD & import.meta.env.MODE !== 'test');
    this.joinQueueHandler = joinQueueHandler;
    this.logUserMessages = logUserMessages;
    this.messages = messages;
    this.modList = modList;
    this.onDelete = onDelete;
    this.onMessageCallback = onMessageCallback;
    this.openQueueHandler = openQueueHandler;
    this.playerExitHandler = playerExitHandler;
    this.previousGames = previousGames;
    this.removeSelectedGameFromHistory = removeSelectedGameFromHistory;
    this.setNextGame = setNextGame;
    this.settings = settings;
    this.onSettingsUpdate = onSettingsUpdate;
    this.startGame = startGame;
    this.toggleAllowGameRequests = toggleAllowGameRequests;
    this.twitchApi = twitchApi;
    this.upcomingGames = upcomingGames;

    // this.validCommands = jsonCommandList;
    this.validGames = jsonJackboxGameList;

    // list of unique values for the max # of players of each game
    this.maxPlayersList = Array.from(
      new Set(
        // flatten the values of an object's objects
        Object.values(jsonJackboxGameList).map(
          pack => Object.values(pack).map(
            game => game['Max players']
          )
        ).flat()
      )
    )
      .filter(i => i && i<50) // only numeric values under 50
      .sort( (a, b) => a-b );

    this.chatCommands = Object.assign({},
      ...Object.values(chatCommands).map(
        cmdObj => cmdObj.commands.map(
          command => ({
            [`${command}`]: cmdObj}
          )
        )
      ).flat()
    );

    this._isInit = false; // indicates if init() has both executed and completed

    if (this.debug) {
      window.console.log('MessageHandler constructed');
    }

    if (init === true) {
      return this.init();
    }
  }

  get isInit() {return this._isInit;}

  init = () => {
    if (this.debug) {window.console.log('MessageHandler - init');}

    if (!this.twitchApi) {
      return window.console.warn('MessageHandler - no _chatClient available');
    }

    this.twitchApi.onMessage = this.onMessage;
    this.client = this.twitchApi._chatClient;
    this._isInit = true;
  };

  isModOrBroadcaster = (username) => {
    return (this.channel === username.toLowerCase() || this.modList.includes(username.toLowerCase()));
  };

  // returns true if a known command was found & responded to
  checkUserCommands = (message, username) => {
    const command = message.trim().toLowerCase().split(' ')[0];
    window.console.log({command, exists: !!this.chatCommands[command]});
    if (this.chatCommands[command]) {
      return this.chatCommands[command].response(this, username, message);
    }
    return;
  };

  findGame = (requestedGame, username) => {
    // easter egg responses
    for (let requestEntry of easterEggRequests) {
      if (requestEntry?.Variants?.includes(requestedGame)) {
        if (typeof requestEntry.Response === 'function') {
          this.sendMessage(`/me @${username} ${requestEntry.Response()}`);
        } else {
          this.sendMessage(`/me @${username} ${requestEntry.Response}`);
        }
        return null;
      }
    }
    // check against games
    for (let partyPackName in this.validGames) {
      const partyPackObj = this.validGames[partyPackName];
      for (const [formalGameName, metadata] of Object.entries(partyPackObj)) {
        if (metadata?.Variants?.includes(requestedGame)) {
          return {
            name: formalGameName,
            longName: `${formalGameName} (${partyPackName})`,
            partyPack: partyPackName,
            ...metadata
          };
        }
      }
    }
    this.sendMessage(`/me @${username}, ${requestedGame} could not be found in the list of available party games.`);
    return;
  };

  checkForGameCommand = (message, username) => {
    if (!message.startsWith(REQUEST_COMMAND)) {return;}

    const requestedGame = message.replace(REQUEST_COMMAND, '').trim();

    if (requestedGame === '') {
      this.sendMessage(`/me @${username}, please specify the game you would like to request: for example, !request TMP 2`);
      return null;
    }

    return this.findGame(requestedGame, username);
  };

  onMessage = (target, tags, msg, self) => {
    if (this.logUserMessages) {
      window.console.log('MessageHandler - onMessage', {target, tags, msg, self});
    }
    if (self) {return;} // ignore messages from yourself
    if (this.onMessageCallback) {
      this.onMessageCallback(msg, tags.username, tags);
    }


    const cleanedMsg = msg.trim().toLowerCase();
    if (this.checkUserCommands(cleanedMsg, tags.username)) {return;}
    // let gameObj = this.checkForGameCommand(cleanedMsg, tags.username);
    // if (!gameObj) {return;}

    return;
  };


  sendMessage = async(msg) => {
    return await this.twitchApi?.sendMessage(msg);
  };
}

