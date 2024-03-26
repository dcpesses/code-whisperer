/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-console */

import {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// import {Button, Modal} from 'react-bootstrap';
// import ChatActivity, { ActivityStatus } from '../ChatActivity';
import MessageCommandHandler from '../twitch-wheel/message-command-handler';
import HeaderMenu from '../twitch-wheel/header-menu';
import PlayerQueue from '@/features/player-queue';
import ModalCommandList from '@/features/modal-command-list';
import { showModalCommandList } from '@/features/modal-command-list/modalSlice';
import { setFakeStates, setUserInfo, setWhisperStatus } from '@/features/player-queue/user-slice.js';
import * as fakeStates from '../twitch-wheel/example-states';

import './main-screen.css';

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

class ImportedMainScreen extends Component {
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
    this.messageHandler = this.initMessageCommandHandler();

  }

  componentDidMount() {
    if (!this.messageHandler && !this.twitchApi && this.props.twitchApi) {
      this.twitchApi = this.props.twitchApi;
      this.messageHandler = this.initMessageCommandHandler();
    }
    if (window.location.hash.indexOf('fakestate=true') !== -1) {
      this.setState(
        Object.assign({}, fakeStates.MainScreen, {
          showPlayerSelect: true
        })
      );
      this.props.setFakeStates(fakeStates.UserStore);
    }
  }
  componentDidUpdate = (prevProps) => {
    if (prevProps.twitchApi?.isChatConnected !== this.props.twitchApi?.isChatConnected
      || !this.messageHandler && this.props.twitchApi?.isChatConnected) {
      this.messageHandler = this.initMessageCommandHandler();
    } else if (this.props.twitchApi?.isChatConnected) {
      this.updateMessageCommandHandler(this.props, this.state);
    }

  };

  initMessageCommandHandler = () => {
    console.log('initMessageCommandHandler');
    if (!this.props.twitchApi?.isChatConnected) {
      console.log('main-screen - initMessageCommandHandler: cannot init; no chat client available');
      return null;
    }
    let messageHandler = new MessageCommandHandler({
      access_token: this.props.access_token,
      allowGameRequests: this.state.allowGameRequests,
      changeNextGameIdx: this.changeNextGameIdx,
      channel: this.props.channel,
      clearQueueHandler: this.routeClearQueueRequest.bind(this),
      closeQueueHandler: this.routeCloseQueueRequest.bind(this),
      joinQueueHandler: this.routePlayRequest.bind(this),
      logUserMessages: this.state.logUserMessages,
      messages: this.state.messages,
      modList: this.props.modList,
      // onDelete: this.removeGame.bind(this),
      onMessageCallback: this.onMessage.bind(this),
      onSettingsUpdate: this.onSettingsUpdate.bind(this),
      openQueueHandler: this.routeOpenQueueRequest.bind(this),
      playerExitHandler: this.routeLeaveRequest.bind(this),
      previousGames: this.state.history.slice(0, this.state.nextGameIdx),
      ref: this.setMessageHandlerRef.bind(this),
      // removeSelectedGameFromHistory: this.removeSelectedGameFromHistory.bind(this),
      // setNextGame: this.setNextGame.bind(this),
      settings: this.state.settings,
      startGame: this.startGame.bind(this),
      // toggleAllowGameRequests: this.toggleAllowGameRequests.bind(this),
      twitchApi: this.props.twitchApi,
      upcomingGames: this.state.history.slice(this.state.nextGameIdx),
    });

    messageHandler.client = this.props.twitchApi._chatClient;
    this.props.twitchApi.onMessage = messageHandler._onMessage;
    return messageHandler;
  };

  updateMessageCommandHandler = (props, state) => {
    if (!this.messageHandler || !this.twitchApi?.isChatConnected) {
      if (!this.twitchApi?.isChatConnected && props.twitchApi?.isChatConnected) {
        this.twitchApi = props.twitchApi;
        this.messageHandler = this.initMessageCommandHandler();
      } else {
        console.log('main-screen - updateMessageCommandHandler: cannot update, chat not yet initialized');
      }
      return;
    }
    this.messageHandler.twitchApi = props.twitchApi;
    this.messageHandler.client = props.twitchApi._chatClient;
    props.twitchApi.onMessage = this.messageHandler.onMessage;
    if (this.messageHandler.access_token !== props.access_token) {
      this.messageHandler.access_token = props.access_token;
    }
    if (this.messageHandler.allowGameRequests !== state.allowGameRequests) {
      this.messageHandler.allowGameRequests = state.allowGameRequests;
    }
    if (this.messageHandler.changeNextGameIdx !== this.changeNextGameIdx) {
      this.messageHandler.changeNextGameIdx = this.changeNextGameIdx;
    }
    if (this.messageHandler.channel !== props.channel) {
      this.messageHandler.channel = props.channel;
    }
    if (this.messageHandler.logUserMessages !== state.logUserMessages) {
      this.messageHandler.logUserMessages = state.logUserMessages;
    }
    if (JSON.stringify(this.messageHandler.messages) !== JSON.stringify(state.messages)) {
      this.messageHandler.messages = state.messages;
    }
    if (JSON.stringify(this.messageHandler.modList) !== JSON.stringify(props.modList)) {
      this.messageHandler.modList = props.modList;
    }
    if (JSON.stringify(this.messageHandler.settings) !== JSON.stringify(state.settings)) {
      this.messageHandler.settings = state.settings;
    }
    if (this.messageHandler.nextGameIdx !== state.nextGameIdx ||
    JSON.stringify(this.messageHandler.history) !== JSON.stringify(state.history)) {
      this.messageHandler.previousGames = state.history.slice(0, state.nextGameIdx);
      this.messageHandler.upcomingGames = state.history.slice(state.nextGameIdx);
    }
    return null;
  };


  getGamesList = () => {
    return {
      allowedGames: this.messageHandler?.allowedGames,
      maxPlayersList: this.messageHandler?.maxPlayersList,
      validGames: this.messageHandler?.validGames
    };
  };
  getOptionsDebugMenu = () => {
    return [{
      label: 'Load Mock Game Requests',
      onClick: () => {
        return this.setState(
          Object.assign({}, fakeStates.MainScreen)
        );
      }
    }, {
      label: 'Load Mock Game & Player Requests',
      onClick: () => {
        return this.setState(
          Object.assign({}, fakeStates.MainScreen, {
            showPlayerSelect: true
          }),
          () => {
            this.playerSelector?.setState(fakeStates.PlayerSelect);
            this.props.setFakeStates(fakeStates.UserStore);
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
      label: 'View Chat Commands',
      onClick: this.handleOpenModalCommandList
    }];
  };

  handleOpenModalCommandList = () => {
    if (this.props.showModalCommandList) {
      return this.props.showModalCommandList();
    }
  };

  onMessage = async(message, user, metadata) => {
    console.log('ImportedMainScreen - onMessage');
    this.twitchApi.updateLastMessageTime(user);
    if (!this.state.userLookup[user] && metadata && metadata['user-id']) {
      this.setState(prevState => ({
        userLookup: Object.assign({}, prevState.userLookup, {[user]: metadata})
      }));
      const userInfo = await this.twitchApi.requestUserInfo({login: user});
      if (userInfo?.data && userInfo?.data[0]) {
        this.props.setUserInfo(userInfo.data[0]);
      }
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
    this.setState((state) => ({
      showOptionsMenu: !state.showOptionsMenu
    }));
  };

  toggleOptionsModal = () => {
    this.setState((state) => ({
      showOptionsModal: !state.showOptionsModal
    }));
  };

  togglePlayerSelect = () => {
    this.setState((state) => ({
      showPlayerSelect: !state.showPlayerSelect
    }));
  };

  routePlayRequest = (user, {sendConfirmationMsg = true, isPrioritySeat = false}) => {
    console.log('ImportedMainScreen - routePlayRequest');
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
    this.setState((state) => ({
      ...state,
      showPlayerSelect: true
    }));
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
      const response = await this.twitchApi.sendWhisper(player, msg);
      this.props.setWhisperStatus({login: player.username, response});
      return;
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
            gamesList={gamesList}
            sendMessage={this.twitchApi?.sendMessage}
            sendWhisper={this.sendWhisper}
            settings={this.state.settings}
            twitchApi={this.props.twitchApi}
            startGame={this.startGame}
            ref={this.setPlayerSelectRef}
            userLookup={this.state.userLookup}
          />
        </div>
        <ModalCommandList />
      </div>
    );
  }
}
ImportedMainScreen.propTypes = {
  access_token: PropTypes.string,
  channel: PropTypes.string,
  modList: PropTypes.object,
  onLogOut: PropTypes.func,
  // profile_image_url: PropTypes.string,
  setFakeStates: PropTypes.func.isRequired,
  setUserInfo: PropTypes.func.isRequired,
  setWhisperStatus: PropTypes.func.isRequired,
  showModalCommandList: PropTypes.func.isRequired,
  toggleDeprecatedView: PropTypes.func,
  twitchApi: PropTypes.object,
  // updateUsername: PropTypes.func,
  // userInfo: PropTypes.object,
  // user_id: PropTypes.any,
  // username: PropTypes.string,
};
ImportedMainScreen.defaultProps = {
  access_token: null,
  channel: null,
  modList: null,
  onLogOut: null,
  profile_image_url: null,
  toggleDeprecatedView: null,
  twitchApi: null,
  updateUsername: null,
  userInfo: null,
  user_id: null,
  username: null,
};
const mapStateToProps = state => ({
  modal: state.modal
});
const mapDispatchToProps = () => ({
  showModalCommandList,
  setFakeStates,
  setUserInfo,
  setWhisperStatus,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps()
)(ImportedMainScreen);
