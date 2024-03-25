// import PropTypes from 'prop-types';
import {Debounce} from '@/utils';
// import jsonCommandList from './Commands.json';
import jsonJackboxGameList from './JackboxGames.json';
import {version} from '../../../package.json';

const REQUEST_COMMAND = '!request';

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

export default class MessageCommandHandler {
  // static get propTypes() {
  //   return {
  //     caniplayHandler: PropTypes.func,
  //     channel: PropTypes.string,
  //     clearQueueHandler: PropTypes.func,
  //     closeQueueHandler: PropTypes.func,
  //     logUserMessages: PropTypes.bool,
  //     modList: PropTypes.object,
  //     onMessage: PropTypes.func,
  //     openQueueHandler: PropTypes.func,
  //     playerExitHandler: PropTypes.func,
  //     startGame: PropTypes.func,
  //     twitchApi: PropTypes.object,
  //     // toggleAllowGameRequests: PropTypes.func,
  //   };
  // }
  // static get defaultProps() {
  //   return {
  //     caniplayHandler: () => void 0,
  //     channel: null,
  //     clearQueueHandler: () => void 0,
  //     closeQueueHandler: () => void 0,
  //     logUserMessages: false,
  //     modList: {},
  //     onMessage: () => void 0,
  //     openQueueHandler: () => void 0,
  //     playerExitHandler: () => void 0,
  //     startGame: () => void 0,
  //     twitchApi: null,
  //     // toggleAllowGameRequests: () => void 0,
  //   };
  // }
  constructor({
    access_token,
    addGameRequest=noop,
    allowGameRequests,
    caniplayHandler=noop,
    changeNextGameIdx,
    channel,
    clearQueueHandler=noop,
    closeQueueHandler=noop,
    debug=true,
    logUserMessages,
    messages,
    modList,
    onDelete=noop,
    onMessage=noop,
    onSettingsUpdate=noop,
    openQueueHandler=noop,
    playerExitHandler=noop,
    previousGames,
    ref,
    removeSelectedGameFromHistory=noop,
    setNextGame=noop,
    settings,
    startGame=noop,
    toggleAllowGameRequests=noop,
    twitchApi,
    upcomingGames,
  }) {

    this.access_token = access_token;
    this.addGameRequest = addGameRequest;
    this.allowGameRequests = allowGameRequests;
    this.caniplayHandler = caniplayHandler;
    this.changeNextGameIdx = changeNextGameIdx;
    this.channel = channel;
    this.clearQueueHandler = clearQueueHandler;
    this.closeQueueHandler = closeQueueHandler;
    this.logUserMessages = logUserMessages;
    this.debug = debug;
    this.messages = messages;
    this.modList = modList;
    this.onDelete = onDelete;
    this.onMessage = onMessage;
    this.openQueueHandler = openQueueHandler;
    this.playerExitHandler = playerExitHandler;
    this.previousGames = previousGames;
    this.ref = ref;
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

    this.isModOrBroadcaster = this.isModOrBroadcaster.bind(this);
    this.checkForMiscCommands = this.checkForMiscCommands.bind(this);
    this.findGame = this.findGame.bind(this);
    this._onMessage = this._onMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.updateMessageCallbackFnDebounced = Debounce(this.updateMessageCallbackFn.bind(this), 150);

    //this.init();
  }

  init = () => {
    if (this.debug) {window.console.log('MessageCommandHandler - init');}

    if (!this.twitchApi) {
      return window.console.warn('MessageCommandHandler - no _chatClient available');
    }

    this.twitchApi.onMessage = this._onMessage;
    this.client = this.twitchApi._chatClient;
  };

  /*
  // add to parent component...?
  componentDidUpdate = (prevProps, prevState) => {
    // this.messageCommandHandler
    console.log('main-screen - componentDidUpdate');
    if (!this.messageCommandHandler) {
      return;
    }
    if (prevProps.access_token !== this.props.access_token) {
      this.messageCommandHandler.access_token = this.props.access_token;
    }
    if (prevState.allowGameRequests !== this.state.allowGameRequests) {
      this.messageCommandHandler.allowGameRequests = this.state.allowGameRequests;
    }
    if (this.changeNextGameIdx !== this.changeNextGameIdx) {
      this.messageCommandHandler.changeNextGameIdx = this.changeNextGameIdx;
    }
    if (prevProps.channel !== this.props.channel) {
      this.messageCommandHandler.channel = this.props.channel;
    }
    if (prevState.logUserMessages !== this.state.logUserMessages) {
      this.messageCommandHandler.logUserMessages = this.state.logUserMessages;
    }
    if (JSON.stringify(prevState.messages) !== JSON.stringify(this.state.messages)) {
      this.messageCommandHandler.messages = this.state.messages;
    }
    if (JSON.stringify(prevProps.modList) !== JSON.stringify(this.props.modList)) {
      this.messageCommandHandler.modList = this.props.modList;
    }
    if (JSON.stringify(prevState.settings) !== JSON.stringify(this.state.settings)) {
      this.messageCommandHandler.settings = this.state.settings;
    }
    if (prevState.nextGameIdx !== this.state.nextGameIdx ||
      JSON.stringify(prevState.history) !== JSON.stringify(this.state.history)) {
      this.messageCommandHandler.previousGames = this.state.history.slice(0, this.state.nextGameIdx);
      this.messageCommandHandler.upcomingGames = this.state.history.slice(this.state.nextGameIdx);
    }
    this.messageCommandHandler.twitchApi = this.props.twitchApi;
  };

  initMessageCommandHandler = () => {
    console.log('initMessageCommandHandler');
    this.messageCommandHandler = new MessageCommandHandler({
      access_token: this.props.access_token,
      allowGameRequests: this.state.allowGameRequests,
      caniplayHandler: this.routePlayRequest,
      changeNextGameIdx: this.changeNextGameIdx,
      channel: this.props.channel,
      clearQueueHandler: this.routeClearQueueRequest,
      closeQueueHandler: this.routeCloseQueueRequest,
      logUserMessages: this.state.logUserMessages,
      messages: this.state.messages,
      modList: this.props.modList,
      onDelete: this.removeGame,
      onMessage: this.onMessage,
      onSettingsUpdate: this.onSettingsUpdate,
      openQueueHandler: this.routeOpenQueueRequest,
      playerExitHandler: this.routeLeaveRequest,
      previousGames: this.state.history.slice(0, this.state.nextGameIdx),
      ref: this.setMessageHandlerRef,
      removeSelectedGameFromHistory: this.removeSelectedGameFromHistory,
      setNextGame: this.setNextGame,
      settings: this.state.settings,
      startGame: this.startGame,
      toggleAllowGameRequests: this.toggleAllowGameRequests,
      twitchApi: this.props.twitchApi,
      upcomingGames: this.state.history.slice(this.state.nextGameIdx),
    });
  };
  */

  onClose = async() => {
    try {
      if (this.client) {
        return await this.client.disconnect();
      }
    } catch (e) {
      window.console.log('MessageCommandHandler - onClose: Error', e);
    }
  };

  updateMessageCallbackFn = () => {
    // ABC: Always Be Chatting
    if (this.debug) {window.console.log('MessageCommandHandler - updateMessageCallbackFn - Always Be Chatting');}
    if (this.twitchApi) {
      this.twitchApi.onMessage = this._onMessage;
    }
  };

  isModOrBroadcaster = (username) => {
    return (this.channel === username || this.modList.includes(username.toLowerCase()));
  };

  // returns true if a known command was found & responded to
  checkForMiscCommands = (message, username) => {
    //========= general =========
    if (message.startsWith('!commands')) {
      let commands = 'This feature is not yet available yet.'; // Object.keys(this.state.validCommands).map(c => `!${c}`).join(' ');
      this.sendMessage(`Code Whisperer Commands: ${commands}`);
      return true;
    }

    if (message.startsWith('!version')) {
      this.sendMessage(`/me is using Game Code Whisperer, v${version} GoatEmotey https://github.com/dcpesses/code-whisperer`);
      return true;
    }

    if (message.startsWith('!whichpack')) {
      const requestedGame = message.replace('!whichpack', '').trim();
      if (requestedGame === '') {
        this.sendMessage(`/me @${username}, please specify the game you would like to look up: e.g. !whichpack TMP 2`);
        return true;
      }

      const gameObj = this.findGame(requestedGame, username);
      if (typeof gameObj === 'object') {
        this.sendMessage(`/me @${username}, ${gameObj.name} is a ${gameObj.partyPack} game.`);
      }
      if (typeof gameObj === 'string') {
        this.sendMessage(gameObj);
      }
      return true;
    }

    //========= player queue management =========
    if (message === '!caniplay' || message.startsWith('!new') || (message.toLowerCase().startsWith('!dew') && this.channel?.toLowerCase() === 'dewinblack')) {
      this.caniplayHandler(username, {
        sendConfirmationMsg: message === '!caniplay'
      });
      return true;
    }

    if (message.startsWith('!priorityseat') || message.startsWith('!redeemseat')) {
      if (!this.isModOrBroadcaster(username)) {
        this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
        return true;
      }
      const redeemingUser = message.replace('!priorityseat', '').replace('!redeemseat', '').replace('@', '').trim();
      if (redeemingUser === '') {
        this.sendMessage(`/me @${username}, please specify the user who has redeemed a priority seat in the next game: for example, ${message.startsWith('!p') ? '!priorityseat' : '!redeemseat'} @asukii314`);
        return true;
      }
      this.caniplayHandler(redeemingUser, {
        sendConfirmationMsg: true,
        isPrioritySeat: true
      });
      return true;
    }

    if ( message.startsWith('!removeuser')) {
      if (!this.isModOrBroadcaster(username)) {
        this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
        return true;
      }
      const exitingUser = message.replace('!removeuser', '').replace('@', '').trim();
      if (exitingUser === '') {
        this.sendMessage(`/me @${username}, please specify the user who will be removed in the next game: for example, !removeuser @dewinblack`);
        return true;
      }
      this.playerExitHandler(exitingUser);
      return true;
    }

    if (message === '!leave' || message === '!murd') {
      this.playerExitHandler(username);
      return true;
    }

    if (message === '!clear') {
      if (this.isModOrBroadcaster(username)) {
        this.clearQueueHandler();
      }
      return true;
    }

    if (message === '!open') {
      if (this.isModOrBroadcaster(username)) {
        this.openQueueHandler();
      }
      return true;
    }

    if (message === '!clearopen') {
      if (this.isModOrBroadcaster(username)) {
        this.clearQueueHandler();
        this.openQueueHandler();
      }
      return true;
    }

    if (message === '!close') {
      if (this.isModOrBroadcaster(username)) {
        this.closeQueueHandler();
      }
      return true;
    }

    if (message === '!startgame') {
      if (!this.isModOrBroadcaster(username)) {
        this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
        return true;
      }
      if (this.startGame()) {
        this.sendMessage(`/me @${username}, the game has been started.`);
      } else {
        this.sendMessage(`/me @${username}, the game was already started.`);
      }
      return true;
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
    for (let partyPackName in this.state.validGames) {
      const partyPackObj = this.state.validGames[partyPackName];
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

  _onMessage = (target, tags, msg, self) => {
    if (this.logUserMessages) {
      window.console.log('MessageCommandHandler - _onMessage', {target, tags, msg, self});
    }
    if (self) {return;} // ignore messages from yourself
    this.onMessage(msg, tags.username, tags);

    const cleanedMsg = msg.trim().toLowerCase();
    if (this.checkForMiscCommands(cleanedMsg, tags.username)) {return;}
    // let gameObj = this.checkForGameCommand(cleanedMsg, tags.username);
    // if (!gameObj) {return;}

    return;
  };


  sendMessage = async(msg) => {
    return await this.twitchApi?.sendMessage(msg);
  };
}
