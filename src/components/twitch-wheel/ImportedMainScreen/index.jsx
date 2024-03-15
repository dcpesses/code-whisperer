/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */

import {Component} from 'react';
// import {Button, Modal} from 'react-bootstrap';
// import ChatActivity, { ActivityStatus } from '../ChatActivity';
import MessageHandler from '../MessageHandler';
import HeaderMenu from '../OptionsMenu';
import PlayerQueue from '../PlayerSelect';
import * as fakeStates from '../example-states';

import './MainScreen.css';

const GAME_PLACEHOLDER = {
  'name': '',
  'longName': '',
  'partyPack': '',
  'Min players': 1,
  'Max players': 16,
  'Variants': [],
  'username': '',
  'time': 0,
  'locked': false,
  'chosen': false
};

export default class ImportedMainScreen extends Component {
  constructor(props) {
    super(props);
    // this.chatActivity = new ChatActivity(this.props.channel);
    let settings = {enableRoomCode: true};
    let isJestEnv = (import.meta.env.VITEST_WORKER_ID !== undefined);
    try {
      let savedSettings = localStorage.getItem('__settings');
      if (savedSettings) {
        settings = JSON.parse(savedSettings);
        if (!isJestEnv) {
          console.log('Saved settings loaded!');
        }
      } else {
        if (!isJestEnv) {
          console.log('No saved settings detected, using defaults.');
        }
      }
    } catch (e) {
      console.log('Unable to load or read saved settings, using defaults.');
    }
    this.state = {
      allowGameRequests: true,
      gameSelected: GAME_PLACEHOLDER,
      messages: {},
      colors: ['#b0a4f9', '#bff0ff', '#7290f9', '#81cef4', '#a3faff', '#96eaff', '#8cf1ff', '#7fc0e8', '#70b3ea', '#92c3fc', '#b2dcf4', '#7b92ed', '#a7d0f2', '#c4f5fc', '#aaefff', '#aabdef', '#9bc0ef', '#99edff', '#70b0f9', '#c4e1ff', '#9a86e8', '#beb9f7',],
      counter: 0,
      history: [GAME_PLACEHOLDER], // requested / played games
      logUserMessages: !!(!import.meta.env.PROD & import.meta.env.MODE !== 'test'),
      nextGameIdx: 0,
      settings,
      showOptionsMenu: false,
      showOptionsModal: false,
      showPlayerSelect: true,
      userLookup: {}
    };

    this.playerSelector = null;
    this.messageHandler = null;

    this.onMessage = this.onMessage.bind(this);
    this.togglePlayerSelect = this.togglePlayerSelect.bind(this);
    this.routePlayRequest = this.routePlayRequest.bind(this);
    this.routeLeaveRequest = this.routeLeaveRequest.bind(this);
    this.routeOpenQueueRequest = this.routeOpenQueueRequest.bind(this);
    this.routeCloseQueueRequest = this.routeCloseQueueRequest.bind(this);
    this.routeClearQueueRequest = this.routeClearQueueRequest.bind(this);
    this.startGame = this.startGame.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.sendWhisper = this.sendWhisper.bind(this);
    this.setMessageHandlerRef = this.setMessageHandlerRef.bind(this);
    this.setPlayerSelectRef = this.setPlayerSelectRef.bind(this);

    this.toggleUserMessageLogging = this.toggleUserMessageLogging.bind(this);

    this.twitchApi = this.props.twitchApi;
  }

  componentDidMount() {
    if (!this.twitchApi) {
      this.twitchApi = this.props.twitchApi;
    }
    if (window.location.hash.indexOf('fakestate=true') !== -1) {
      this.setState(
        Object.assign({}, fakeStates.ImportedMainScreen, {
          showPlayerSelect: true
        })
      );
    }
  }

  clearModal = () => {
    this.setState({
      gameSelected: null
    });
  };

  getGamesList = () => {
    return {
      allowedGames: this.messageHandler?.state.allowedGames,
      validGames: this.messageHandler?.state.validGames
    };
  };
  getOptionsDebugMenu = () => {
    return [{
      label: 'Load Mock Game Requests',
      onClick: () => {
        return this.setState(
          Object.assign({}, fakeStates.ImportedMainScreen)
        );
      }
    }, {
      label: 'Load Mock Game & Player Requests',
      onClick: () => {
        return this.setState(
          Object.assign({}, fakeStates.ImportedMainScreen, {
            showPlayerSelect: true
          }),
          () => {
            this.playerSelector?.setState(fakeStates.PlayerSelect);
          }
        );
      }
    }, {
      label: 'Log Debug Environment',
      onClick: () => {
        console.log('NODE_ENV:', import.meta.env.NODE_ENV);
        console.log('VITE_APP_REDIRECT_URI:', import.meta.env.VITE_APP_REDIRECT_URI);
      }
    }, {
      label: 'Toggle User Message Logging',
      onClick: () => {
        return this.toggleUserMessageLogging();
      }
    }];
  };

  toggleUserMessageLogging = () => {
    return this.setState(prevState => ({
      logUserMessages: !prevState.logUserMessages
    }), () => console.log('toggleUserMessageLogging | new state: ', this.state.logUserMessages?.toString()));
  };

  getOptionsMenu = () => {
    return [{
      label: 'Load Mock Player Requests',
      onClick: () => {
        return this.setState(
          Object.assign({}, fakeStates.ImportedMainScreen, {
            showPlayerSelect: true
          }),
          () => {
            this.playerSelector?.setState(fakeStates.PlayerSelect);
          }
        );
      }
    }];
  };

  onMessage = (message, user, metadata) => {
    this.twitchApi.updateLastMessageTime(user);
    if (!this.state.userLookup[user] && metadata && metadata['user-id']) {
      this.setState(prevState => ({
        userLookup: Object.assign({}, prevState.userLookup, {[user]: metadata})
      }));
    }
  };

  onSettingsUpdate = (nextSettings) => {
    let {settings} = this.state;
    localStorage.setItem('__settings', JSON.stringify(
      Object.assign({}, settings, nextSettings)
    ));
    console.log('Settings saved:', settings);
    return this.setState({
      settings: Object.assign({}, settings, nextSettings)
    });
  };

  toggleOptionsMenu = () => {
    this.setState((state) => {
      return {
        showOptionsMenu: !state.showOptionsMenu
      };
    });
  };

  toggleOptionsModal = () => {
    this.setState((state) => {
      return {
        showOptionsModal: !state.showOptionsModal
      };
    });
  };

  togglePlayerSelect = () => {
    this.setState((state) => {
      return {
        showPlayerSelect: !state.showPlayerSelect
      };
    });
  };

  routePlayRequest = (user, {sendConfirmationMsg = true, isPrioritySeat = false}) => {
    const msg = this.state.showPlayerSelect
      ? this.playerSelector?.handleNewPlayerRequest(user, {isPrioritySeat})
      : 'sign-ups are currently closed; try again after this game wraps up!';

    if (sendConfirmationMsg) {
      this.twitchApi?.sendMessage(`/me @${user}, ${msg}`);
    }
  };

  routeLeaveRequest = (user) => {
    this.playerSelector?.removeUser(user);
  };

  routeOpenQueueRequest = () => {
    this.setState((state) => {
      return {
        ...state,
        showPlayerSelect: true
      };
    });
    this.playerSelector?.openQueue();
  };

  routeCloseQueueRequest = () => {
    this.playerSelector?.closeQueue();
  };

  routeClearQueueRequest = () => {
    this.playerSelector?.clearQueue();
  };

  sendMessage = (msg) => {
    return this.twitchApi?.sendMessage(msg);
  };

  // https://dev.twitch.tv/docs/api/reference/#send-whisper
  // note: access token must include user:manage:whispers scope
  // note: sending user must have a verified phone number
  /**
     * Sends a message to the user specified in the player object
     * @param {object} player Contains the username and id of recipient
     * @param {string} msg The message to be sent
     * @returns Promise
     */
  sendWhisper = async(player, msg) => {
    if (this.twitchApi?.sendWhisper) {
      return await this.twitchApi?.sendWhisper(player, msg);
    }
    return window.console.log('ImportedMainScreen - sendWhisper: no whisper sent', player, msg);
  };

  startGame = () => {
    if (this.state.showPlayerSelect) {
      this.togglePlayerSelect();
      return true;
    }
    return false;
  };

  setMessageHandlerRef = (ps) => {
    this.messageHandler = ps;
  };

  setPlayerSelectRef = (mh) => {
    this.playerSelector = mh;
  };

  render() {

    let gamesList = this.getGamesList();

    return (
      <div className="main-screen">
        <MessageHandler
          access_token={this.props.access_token}
          allowGameRequests={this.state.allowGameRequests}
          caniplayHandler={this.routePlayRequest}
          changeNextGameIdx={this.changeNextGameIdx}
          channel={this.props.channel}
          clearQueueHandler={this.routeClearQueueRequest}
          closeQueueHandler={this.routeCloseQueueRequest}
          logUserMessages={this.state.logUserMessages}
          messages={this.state.messages}
          modList={this.props.modList}
          onDelete={this.removeGame}
          onMessage={this.onMessage}
          onSettingsUpdate={this.onSettingsUpdate}
          openQueueHandler={this.routeOpenQueueRequest}
          playerExitHandler={this.routeLeaveRequest}
          previousGames={this.state.history.slice(0, this.state.nextGameIdx)}
          ref={this.setMessageHandlerRef}
          removeSelectedGameFromHistory={this.removeSelectedGameFromHistory}
          setNextGame={this.setNextGame}
          settings={this.state.settings}
          startGame={this.startGame}
          toggleAllowGameRequests={this.toggleAllowGameRequests}
          twitchApi={this.props.twitchApi}
          upcomingGames={this.state.history.slice(this.state.nextGameIdx)}
        />
        <HeaderMenu
          gamesList={gamesList}
          parentState={this.state}
          debugItems={this.getOptionsDebugMenu()}
          items={this.getOptionsMenu()}
          reloadGameList={this.messageHandler?.reloadGameList}
          onHide={this.toggleOptionsMenu}
          onLogout={this.props.onLogOut}
          onSettingsUpdate={this.onSettingsUpdate}
          settings={this.state.settings}
          showOptionsMenu={this.state.showOptionsMenu}
          twitchApi={this.props.twitchApi}
          toggleDeprecatedView={this.props.toggleDeprecatedView}
        />
        <div id="content" className="container mx-auto">
          <PlayerQueue
            _game={this.state.history?.[this.state.nextGameIdx]}
            game={GAME_PLACEHOLDER}
            sendMessage={this.twitchApi?.sendMessage}
            sendWhisper={this.twitchApi?.sendWhisper}
            settings={this.state.settings}
            twitchApi={this.props.twitchApi}
            startGame={this.startGame}
            ref={this.setPlayerSelectRef}
            userLookup={this.state.userLookup}
          />
        </div>
      </div>
    );
  }
}
