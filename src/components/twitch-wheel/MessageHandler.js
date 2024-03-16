import {Component} from 'react';
import PropTypes from 'prop-types';
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

export default class MessageHandler extends Component {
  static get propTypes() {
    return {
      caniplayHandler: PropTypes.func,
      channel: PropTypes.string,
      clearQueueHandler: PropTypes.func,
      closeQueueHandler: PropTypes.func,
      logUserMessages: PropTypes.bool,
      modList: PropTypes.object,
      onMessage: PropTypes.func,
      openQueueHandler: PropTypes.func,
      playerExitHandler: PropTypes.func,
      startGame: PropTypes.func,
      twitchApi: PropTypes.object,
      // toggleAllowGameRequests: PropTypes.func,
    };
  }
  static get defaultProps() {
    return {
      caniplayHandler: () => void 0,
      channel: null,
      clearQueueHandler: () => void 0,
      closeQueueHandler: () => void 0,
      logUserMessages: false,
      modList: {},
      onMessage: () => void 0,
      openQueueHandler: () => void 0,
      playerExitHandler: () => void 0,
      startGame: () => void 0,
      twitchApi: null,
      // toggleAllowGameRequests: () => void 0,
    };
  }
  constructor(props) {
    super(props);

    // list of unique values for the max # of players of each game
    const maxPlayersList = Array.from(
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

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      maxPlayersList,
      // validCommands: jsonCommandList,
      validGames: jsonJackboxGameList
    };
    this.isModOrBroadcaster = this.isModOrBroadcaster.bind(this);
    this.checkForMiscCommands = this.checkForMiscCommands.bind(this);
    this.findGame = this.findGame.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.updateMessageCallbackFnDebounced = Debounce(this.updateMessageCallbackFn.bind(this), 150);
  }

  componentDidMount = () => {
    if (this.debug) {window.console.log('componentDidMount - connect');}

    if (!this.props.twitchApi) {
      return window.console.warn('componentDidMount - no _chatClient available');
    }

    this.props.twitchApi.onMessage = this.onMessage;
    this.client = this.props.twitchApi._chatClient;
  };

  componentDidUpdate = async(prevProps) => {
    if (!prevProps.twitchApi?._chatClient && this.props.twitchApi?._chatClient) {
      try {
        // await this.client.disconnect();
        if (this.debug) {window.console.log('componentDidUpdate - connect');}
        this.client = this.props.twitchApi._chatClient;
        this.props.twitchApi.onMessage = this.onMessage;
      } catch (e) {
        window.console.log('componentDidUpdate: Error setting twitchApi.onMessage:', e);
      }
    } else {
      if (this.props.twitchApi) {
        this.updateMessageCallbackFn();
      } else {
        // Wait a bit for `onDelayedMount` to run in AuthenticatedApp.
        // Primarily needed for hot updates during app development
        // until proper refactoring into the TwitchApi class can occur.
        this.updateMessageCallbackFnDebounced();
      }
    }
  };

  componentWillUnmount = async() => {
    try {
      if (this.client) {
        return await this.client.disconnect();
      }
    } catch (e) {
      window.console.log('Error', e);
    }
  };

  updateMessageCallbackFn = () => {
    // ABC: Always Be Chatting
    if (this.debug) {window.console.log('componentDidUpdate - Always Be Chatting');}
    if (this.props.twitchApi) {
      this.props.twitchApi.onMessage = this.onMessage;
    }
  };

  isModOrBroadcaster = (username) => {
    return (this.props.channel === username || this.props.modList.includes(username.toLowerCase()));
  };

  // returns true if a known command was found & responded to
  checkForMiscCommands = (message, username) => {
    //========= general =========
    if (message.startsWith('!commands')) {
      let commands = 'This feature is not yet available.'; // Object.keys(this.state.validCommands).map(c => `!${c}`).join(' ');
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
      if (gameObj) {
        this.sendMessage(`/me @${username}, ${gameObj.name} is a ${gameObj.partyPack} game.`);
      }
      return true;
    }

    //========= player queue management =========
    if (message === '!caniplay' || message.startsWith('!new') || (message.toLowerCase().startsWith('!dew') && this.props?.channel?.toLowerCase() === 'dewinblack')) {
      this.props?.caniplayHandler(username, {
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
      this.props?.caniplayHandler(redeemingUser, {
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
      this.props?.playerExitHandler(exitingUser);
      return true;
    }

    if (message === '!leave' || message === '!murd') {
      this.props?.playerExitHandler(username);
      return true;
    }

    if (message === '!clear') {
      if (this.isModOrBroadcaster(username)) {
        this.props?.clearQueueHandler();
      }
      return true;
    }

    if (message === '!open') {
      if (this.isModOrBroadcaster(username)) {
        this.props?.openQueueHandler();
      }
      return true;
    }

    if (message === '!clearopen') {
      if (this.isModOrBroadcaster(username)) {
        this.props?.clearQueueHandler();
        this.props?.openQueueHandler();
      }
      return true;
    }

    if (message === '!close') {
      if (this.isModOrBroadcaster(username)) {
        this.props?.closeQueueHandler();
      }
      return true;
    }

    if (message === '!startgame') {
      if (!this.isModOrBroadcaster(username)) {
        this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
        return true;
      }
      if (this.props.startGame()) {
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

  onMessage = (target, tags, msg, self) => {
    if (this.props.logUserMessages) {
      window.console.log({target, tags, msg, self});
    }
    if (self) {return;} // ignore messages from yourself
    this.props.onMessage(msg, tags.username, tags);

    const cleanedMsg = msg.trim().toLowerCase();
    if (this.checkForMiscCommands(cleanedMsg, tags.username)) {return;}
    // let gameObj = this.checkForGameCommand(cleanedMsg, tags.username);
    // if (!gameObj) {return;}

    return;
  };

  sendMessage = async(msg) => {
    return await this.props.twitchApi?.sendMessage(msg);
  };

  render() {
    return null;
  }
}
