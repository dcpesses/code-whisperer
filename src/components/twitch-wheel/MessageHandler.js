import {Component} from 'react';
import PropTypes from 'prop-types';
import jsonCommandList from './Commands.json';
import jsonJackboxGameList from './JackboxGames.json';
import {version} from '../../../package.json';

// const GAME_REQUEST_COMMAND = '!request';
// const GAME_SUBREQUEST_COMMAND = '!subrequest';

export const easterEggRequests = [
  {
    RequestName: 'Version',
    Response: `is using Game Code Whisperer, v${version}`,
    Variants: [
      'version',
      'v',
      'info'
    ]
  }, {
    RequestName: 'Affection',
    Response: () => 'there there, it\'s going to be okay. VirtualHug',
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
    Response: 'please don\'t taunt the wheel. Honk.',
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
    Response: 'please don\'t taunt the wheel. sirfar3Lewmon sirfar3Lewmon sirfar3Lewmon',
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
    this.state = {
      // client: null,
      // allowedGames: {},
      // eslint-disable-next-line react/no-unused-state
      validCommands: jsonCommandList,
      validGames: jsonJackboxGameList
    };
    // this.getTwitchClient = this.getTwitchClient.bind(this);
    this.isModOrBroadcaster = this.isModOrBroadcaster.bind(this);
    this.checkForMiscCommands = this.checkForMiscCommands.bind(this);
    this.findGame = this.findGame.bind(this);
    // this.checkForGameCommand = this.checkForGameCommand.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.allowGameCommands = false;
  }
  componentDidMount = () => {
    // const client = this.getTwitchClient(this.props);
    if (this.debug) {window.console.log('componentDidMount - connect');}
    this.client = this.props.twitchApi?._chatClient;
    if (!this.client) {return window.console.warn('componentDidMount - no _chatClient');}
    this.props.twitchApi.onMessage = this.onMessage;
    // this.client.on('message', this.onMessage);
    // this.client.connect();
    // this.props.twitchApi.onMessage = this.onMessage;
    // return this.getTwitchClient(this.props);
  };

  componentDidUpdate = async(prevProps) => {

    if (!prevProps.twitchApi?._chatClient && this.props.twitchApi?._chatClient) {
      try {
        // await this.client.disconnect();
        if (this.debug) {window.console.log('componentDidUpdate - connect');}
        this.client = this.props.twitchApi._chatClient;
        this.props.twitchApi.onMessage = this.onMessage;

        // this.client.on('message', this.onMessage);
        // this.client.connect();
      } catch (e) {
        window.console.log('componentDidUpdate: Error setting twitchApi.onMessage:', e);
      }
    } else {
      // ABC: Always Be Chatting
      if (this.debug) {window.console.log('componentDidUpdate - Always Be Chatting');}
      if (this.props.twitchApi) {
        this.props.twitchApi.onMessage = this.onMessage;
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

  // getCommandList = async(yamlCommandsList, client) => {
  //   return await fetch(yamlCommandsList)
  //     .then(r => r.text())
  //     .then(text => {
  //       return this.setState({
  //         client,
  //         validCommands: YAML.parse(text)
  //       });
  //     }).catch(e => {
  //       console.warn(e);
  //     });
  // };

  // getGameList = async(yamlGameList, client) => {
  //   return await fetch(yamlGameList)
  //     .then(r => r.text())
  //     .then(text => {
  //       return this.setState({
  //         client,
  //         validGames: YAML.parse(text)
  //       });
  //     }).catch(e => {
  //       console.warn(e);
  //     });
  // };

  // getTwitchClient = (props) => {
  //   return new tmi.client({
  //     identity: {
  //       username: props.channel,
  //       password: props.access_token
  //     },
  //     channels: [
  //       props.channel
  //     ],
  //     options: {
  //       skipUpdatingEmotesets: true,
  //       updateEmotesetsTimer: 0
  //     }
  //   });
  // };

  isModOrBroadcaster = (username) => {
    return (this.props.channel === username || this.props.modList.includes(username.toLowerCase()));
  };

  // returns true if a known command was found & responded to
  checkForMiscCommands = (message, username) => {
    //========= general =========
    if (this.allowGameCommands === true && message.startsWith('!commands')) {
      let commands = Object.keys(this.state.validCommands).map(c => `!${c}`).join(' ');
      this.sendMessage(`Code Whisperer Commands: ${commands}`);
      return true;
    }

    if (this.allowGameCommands === true && (message.startsWith('!gamelist') || message.startsWith('!gameslist'))) {
      this.sendMessage(`/me @${username}, click here for a list of available games: ${process.env.REACT_APP_REDIRECT_URI_NOENCODE}/gamelist`);
      return true;
    }

    if (this.allowGameCommands === true && message === '!wheelcommands') {
      this.sendMessage(`/me @${username}, click here to read about all supported commands: https://github.com/asukii314/twitch-request-wheel/blob/master/src/Commands.yaml`);
      return true;
    }

    if (message.startsWith('!whichpack')) {
      const requestedGame = message.replace('!whichpack', '').trim();
      if (requestedGame === '') {
        this.sendMessage(`/me @${username}, please specify the game you would like to look up the party pack for: e.g. !whichpack TMP 2`);
        return true;
      }

      const gameObj = this.findGame(requestedGame, username);
      if (gameObj) {
        this.sendMessage(`/me @${username}, ${gameObj.name} is a ${gameObj.partyPack} game.`);
      }
      return true;
    }

    //========= list requested games =========
    // if (message === '!onthewheel' || message.startsWith('!gamesqueue') || message === '!listrequests') {
    //   let pipe = (this.props.settings?.customDelimiter)
    //     ? ` ${this.props.settings.customDelimiter} `
    //     : ' ⋆ ';
    //   let requests = Object.values(this.props.messages).map(m => m.name).sort();
    //   try {
    //     this.sendMessage(`/me @${username}, Requested: ${requests.join(pipe)}.`);
    //   } catch (e) {
    //     this.sendMessage(`/me @${username}, Sorry, there are waaaaaaaaay too many games to list and something went wrong. :p`);
    //     console.log(e);
    //   }

    //   // TODO: handle if over character count
    //   // TODO: determine if this is actually necessary
    //   /* this.sendMessage(`/me @${username}, NOTE: There are a loooooot of games to list, but hopefully this next message won't break:`);
    //         this.sendMessage(`/me @${username}, Requested: ${requests}.`);
    //         requestsArr.reduce((list, str) => {
    //             const last = list[list.length-1];
    //             if (last && last.total + str.length <= 480) {
    //                 last.total += str.length;
    //                 last.words.push(str);
    //             } else {
    //                 list.push({
    //                     total: str.length,
    //                     words: [str]
    //                 });
    //             }
    //             return list;
    //         }, [])
    //         .map(({ words }) => words.join(pipe));*/
    //   return true;
    // }

    //========= enable / disable requests =========
    // if ( message.startsWith('!enablerequests')) {
    //   if (!this.isModOrBroadcaster(username)) {
    //     this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
    //     return true;
    //   }
    //   this.props?.toggleAllowGameRequests(true);
    //   this.sendMessage(`/me @${username}, requests have now been enabled! Type "!request" followed by the game you want to play.`);
    //   return true;
    // }
    // if ( message.startsWith('!disablerequests')) {
    //   if (!this.isModOrBroadcaster(username)) {
    //     this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
    //     return true;
    //   }
    //   this.props?.toggleAllowGameRequests(false);
    //   this.sendMessage(`/me @${username}, requests have now been disabled.`);
    //   return true;
    // }

    //========= remove selected game =========

    // if ( message.startsWith('!removegame')) {
    //   if (!this.isModOrBroadcaster(username)) {
    //     this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
    //     return true;
    //   }
    //   let prevSelectedGame = this.props?.removeSelectedGameFromHistory();
    //   if (prevSelectedGame === false) {
    //     this.sendMessage(`/me @${username}, a game must be selected before you can remove it.`);
    //   } else {
    //     this.sendMessage(`/me @${username}, the next game, ${prevSelectedGame.name}, has been removed.`);
    //   }
    //   return true;
    // }

    //========= advance next game =========
    // if (message === '!advancenextgame' || message === '!nextgamefwd' || message === '!nextgameforward') {
    //   if (!this.isModOrBroadcaster(username)) {
    //     this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
    //     return true;
    //   }
    //   if (this.props.changeNextGameIdx(1)) {
    //     if (this.props.upcomingGames.length > 0) {
    //       // console.log(this.props.upcomingGames)
    //       this.sendMessage(`/me @${username}, the next game has been changed to ${this.props.upcomingGames[0].name}.`);
    //     } else {
    //       this.sendMessage(`/me @${username}, the next game has been marked as "TBD".`);
    //     }
    //   } else {
    //     this.sendMessage(`/me @${username}, there are no more games in the queue to advance to!`);
    //   }
    //   return true;
    // }

    //========= advance prev game =========
    // if (message === '!advanceprevgame' || message === '!nextgameback' || message === '!nextgamebackward') {
    //   if (!this.isModOrBroadcaster(username)) {
    //     this.sendMessage(`/me @${username}, only channel moderators can use this command.`);
    //     return true;
    //   }
    //   if (this.props.changeNextGameIdx(-1)) {
    //     this.sendMessage(`/me @${username}, the next game has been changed to ${this.props.upcomingGames[0].name}.`);
    //   } else {
    //     this.sendMessage(`/me @${username}, there are no previous games in the queue to go back to!`);
    //   }
    //   return true;
    // }

    //========= set next game =========
    // if (message.startsWith('!setnextgame') || message.startsWith('!sng') || message.startsWith('!redeemgame')) {
    //   if (!this.isModOrBroadcaster(username)) {
    //     this.sendMessage(`/me @${username}, only channel moderators can use the ${message.startsWith('!s') ? '!setNextGame' : '!redeemgame'} command.`);
    //     return true;
    //   }

    //   const requestedGame = message.replace('!setnextgame', '').replace('!sng', '').replace('!redeemgame', '').trim();
    //   if (requestedGame === '') {
    //     this.sendMessage(`/me @${username}, please specify the game you would like to insert in the queue: for example, ${message.startsWith('!s') ? '!setnextgame' : '!redeemgame'} TMP 2`);
    //     return true;
    //   }

    //   const gameObj = this.findGame(requestedGame, username);
    //   if (gameObj) {
    //     const numGamesAhead = this.props.setNextGame(gameObj);
    //     if (numGamesAhead === 0) {
    //       this.sendMessage(`/me @${username}, ${gameObj.name} has been inserted as the next game in the queue.`);
    //     } else {
    //       this.sendMessage(`/me @${username}, ${gameObj.name} has been inserted in the queue following ${numGamesAhead} other manual game request${numGamesAhead > 1 ? 's' : ''}.`);
    //     }
    //     if (this.props.settings?.clearSeatsAfterRedeem === true) {
    //       this.props?.clearQueueHandler();
    //     }
    //   }
    //   return true;
    // }

    //========= add games from party pack =========
    // if (message.startsWith('!addpack') || message.startsWith('!pack')) {
    //   if (!this.isModOrBroadcaster(username)) {
    //     this.sendMessage(`/me @${username}, only channel moderators can use the ${message.startsWith('!a') ? '!addpack' : '!pack'} command.`);
    //     return true;
    //   }

    //   const requestedPack = message.replace('!addpack', '').replace('!pack', '').trim();
    //   if (requestedPack === '') {
    //     this.sendMessage(`/me @${username}, please specify the pack you would like to insert in the queue: for example, ${message.startsWith('!a') ? '!addpack' : '!pack'} 9`);
    //     return true;
    //   }

    //   if (requestedPack.toLowerCase() === 'standalone') {
    //     this.sendMessage(`/me @${username}, sorry, you can only add Jackbox Party Pack games with this command.`);
    //     return true;
    //   }

    //   const packObj = this.addPack(requestedPack, username);
    //   if (packObj) {
    //     this.sendMessage(`/me @${username}, ${packObj.name} games have been added to the request queue.`);
    //   } else {
    //     this.sendMessage(`/me @${username}, no games added; could not find any games for Party Pack ${requestedPack}.`);
    //   }
    //   return true;
    // }

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

    // if (message.startsWith('!redeem')) {
    //   this.sendMessage(`/me @${username}, this command is no longer supported: please specify either !redeemgame or !redeemseat.`);
    //   return true;
    // }
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

  // checkForGameCommand = (message, username) => {
  //   if (!message.startsWith(GAME_REQUEST_COMMAND)) {return;}

  //   const requestedGame = message.replace(GAME_REQUEST_COMMAND, '').trim();

  //   if (requestedGame === '') {
  //     this.sendMessage(`/me @${username}, please specify the game you would like to request: for example, !request TMP 2`);
  //     return null;
  //   }

  //   return this.findGame(requestedGame, username);
  // };

  // checkForSubrequest = (message, username, subscriber) => {
  //   if (!message.startsWith(GAME_SUBREQUEST_COMMAND)) {return;}
  //   if (subscriber !== true && this.props.channel !== username && username.toLowerCase() !== 'dannyzonegames') {
  //     this.sendMessage(`/me @${username}, you must be a subscriber to use this command.`);
  //     return null;
  //   }

  //   const requestedGame = message.replace(GAME_SUBREQUEST_COMMAND, '').trim();

  //   if (requestedGame === '') {
  //     this.sendMessage(`/me @${username}, please specify the game you would like to request: for example, !request TMP 2`);
  //     return null;
  //   }

  //   return this.findGame(requestedGame, username);
  // };


  onMessage = (target, tags, msg, self) => {
    if (this.props.logUserMessages) {
      window.console.log({target, tags, msg, self});
    }
    if (self) {return;} // ignore messages from yourself
    this.props.onMessage(msg, tags.username, tags);

    const cleanedMsg = msg.trim().toLowerCase();
    if (this.checkForMiscCommands(cleanedMsg, tags.username)) {return;}
    // let gameObj = this.checkForGameCommand(cleanedMsg, tags.username);
    // let isSubRequest = false;
    // if (!gameObj && this.props.settings?.enableSubRequests) {
    //   isSubRequest = true;
    //   gameObj = this.checkForSubrequest(cleanedMsg, tags.username, tags.subscriber);
    // }
    // if (!gameObj) {return;}

    // if (this.props.messages[gameObj.longName]) {
    //   let requestedBy = (this.props.messages[gameObj.longName].username === tags.username) ? 'yourself, silly' : this.props.messages[gameObj.longName].username;
    //   this.sendMessage(`/me @${tags.username}, ${gameObj.name} has already been requested by ${requestedBy}!`);
    //   return;
    // }

    // let prevRequestedGameName = null;
    // let prevSubRequestedGameName = null;
    // for (const metadata of Object.values(this.props.messages)) {
    //   if (metadata.username === tags.username && metadata.isSubRequest === isSubRequest) {
    //     if (isSubRequest) {
    //       prevSubRequestedGameName = metadata.longName;
    //     } else {
    //       prevRequestedGameName = metadata.longName;
    //     }
    //     break;
    //   }
    // }

    // let enableSubRequestLimit = this.props.settings?.enableSubRequestLimit;
    // if (prevRequestedGameName || prevSubRequestedGameName) {
    //   if (this.props.channel === tags.username) {
    //     this.sendMessage(`/me @${tags.username}, ${gameObj.name} has been added to the request queue. Your previous game request(s) weren't deleted, since you have special broadcaster privilege :P`);
    //   } else if (isSubRequest && (!enableSubRequestLimit || (enableSubRequestLimit && !prevSubRequestedGameName))) {
    //     this.sendMessage(`/me @${tags.username}, ${gameObj.name} has been added to the request queue via a subrequest.`);
    //   } else if (prevSubRequestedGameName) {
    //     this.props.onDelete(prevSubRequestedGameName);
    //     this.sendMessage(`/me @${tags.username}, your previous request of ${prevSubRequestedGameName} has been replaced with ${gameObj.name}.`);
    //   } else {
    //     this.props.onDelete(prevRequestedGameName);
    //     this.sendMessage(`/me @${tags.username}, your previous request of ${prevRequestedGameName} has been replaced with ${gameObj.name}.`);
    //   }
    // } else if (Object.values(this.state.allowedGames).filter(g => g.game === gameObj.name && g.pack === gameObj.partyPack && g.enabled !== true).length === 1) {
    //   this.sendMessage(`/me @${tags.username}, ${gameObj.name} is not currently enabled and was not added to the queue.`);
    //   return;
    // } else {
    //   this.sendMessage(`/me @${tags.username}, ${gameObj.name} has been added to the request queue.`);
    // }

    // this.props.addGameRequest(gameObj, tags.username, isSubRequest);
    return;
  };

  // addPack = (pack, username) => {
  //   for (let partyPackName in this.state.validGames) {
  //     let packslug = partyPackName.trim().toLowerCase().replace(/([^\d]+)/gi, '');
  //     window.console.log({packslug, pack});
  //     if (packslug === pack) {
  //       let partyPackObj = this.state.validGames[partyPackName];
  //       for (const [formalGameName, metadata] of Object.entries(partyPackObj)) {
  //         this.props.addGameRequest({
  //           name: formalGameName,
  //           longName: `${formalGameName} (${partyPackName})`,
  //           partyPack: partyPackName,
  //           ...metadata
  //         }, username, false);
  //       }
  //       return {name: partyPackName};
  //     }
  //   }
  //   return;
  // };

  sendMessage = async(msg) => {
    return await this.props.twitchApi?.sendMessage(this.props.channel, msg);
  };

  // setAllowedGames = (allowedGames) => {
  //   this.setState({
  //     allowedGames
  //   });
  // };


  render() {
    return null;
  }
}
