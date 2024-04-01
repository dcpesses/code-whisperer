/* eslint-disable no-console */

import {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// import {Button, Modal} from 'react-bootstrap';
import MessageHandler from '@/features/twitch-messages/message-handler';
import HeaderMenu from '../twitch-wheel/header-menu';
import PlayerQueue from '@/features/player-queue';
import ModalChangelog from '@/features/modal-changelog';
import ModalCommandList from '@/features/modal-command-list';
import { showModalCommandList } from '@/features/modal-command-list/modalSlice';
import { setFakeStates, setChatterInfo, setWhisperStatus } from '@/features/player-queue/user-slice.js';
import * as fakeStates from '../twitch-wheel/example-states';

import {version} from '../../../package.json';

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

class MainScreen extends Component {
  constructor(props) {
    super(props);

    let settings = {enableRoomCode: true};
    try {
      const isJestEnv = (import.meta.env.VITEST_WORKER_ID !== undefined);
      const savedSettings = localStorage.getItem('__settings');
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

    const lastVersion = localStorage.getItem('__version');

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
      showChangelogModal: (lastVersion !== version),
      showOptionsMenu: false,
      showOptionsModal: false,
      showPlayerSelect: true,
      userLookup: {},
      activeChannel: null,
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
    this.messageHandler = this.initMessageHandler();

  }

  componentDidMount() {
    localStorage.setItem('__version', version);
    if (!this.messageHandler && !this.twitchApi && this.props.twitchApi) {
      this.twitchApi = this.props.twitchApi;
      this.messageHandler = this.initMessageHandler();
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
  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.twitchApi?.isChatConnected !== this.props.twitchApi?.isChatConnected
      || !this.messageHandler && this.props.twitchApi?.isChatConnected) {
      this.messageHandler = this.initMessageHandler();
    } else if (this.props.twitchApi?.isChatConnected) {
      this.updateMessageHandler(this.props, this.state);

      // remove any custom command terms if necessary
      if (!this.state.settings.customJoinCommand && prevState.settings.customJoinCommand) {
        this.messageHandler.updateChatCommandTerm('joinQueue', this.state.settings.customJoinCommand);
      }
      if (!this.state.settings.customLeaveCommand && prevState.settings.customLeaveCommand) {
        this.messageHandler.updateChatCommandTerm('leaveQueue', this.state.settings.customLeaveCommand);
      }
    }
  };

  initMessageHandler = () => {
    console.log('initMessageHandler');
    if (!this.props.twitchApi?.isChatConnected) {
      console.log('main-screen - initMessageHandler: cannot init; no chat client available');
      return null;
    }
    let messageHandler = new MessageHandler({
      access_token: this.props.access_token,
      allowGameRequests: this.state.allowGameRequests,
      changeNextGameIdx: this.changeNextGameIdx,
      channel: this.props.channel,
      clearQueueHandler: this.routeClearQueueRequest.bind(this),
      closeQueueHandler: this.routeCloseQueueRequest.bind(this),
      joinQueueHandler: this.routePlayRequest.bind(this),
      listQueueHandler: this.routeListPlayingQueueRequest.bind(this),
      logUserMessages: this.state.logUserMessages,
      messages: this.state.messages,
      moderators: this.props.moderators,
      // onDelete: this.removeGame.bind(this),
      // onInit: this.onMessageHandlerInit.bind(this),
      onMessageCallback: this.onMessage.bind(this),
      onSettingsUpdate: this.onSettingsUpdate.bind(this),
      openQueueHandler: this.routeOpenQueueRequest.bind(this),
      playerExitHandler: this.routeLeaveRequest.bind(this),
      previousGames: this.state.history.slice(0, this.state.nextGameIdx),
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
    if (this.state.settings?.customJoinCommand ) {
      messageHandler.updateChatCommandTerm('joinQueue', this.state.settings.customJoinCommand);
    }
    if (this.state.settings?.customLeaveCommand) {
      messageHandler.updateChatCommandTerm('leaveQueue', this.state.settings.customLeaveCommand);
    }
    return messageHandler;
  };

  updateMessageHandler = (props, state) => {
    if (this.debug) {window.console.log('updateMessageHandler', {hasProps: !!props, hasState: !!state});}
    props = props || this.props;
    state = state || this.state;
    if (!this.messageHandler || !this.twitchApi?.isChatConnected) {
      if (!this.twitchApi?.isChatConnected && props.twitchApi?.isChatConnected) {
        this.twitchApi = props.twitchApi;
        this.messageHandler = this.initMessageHandler();
      } else {
        console.log('main-screen - updateMessageHandler: cannot update, chat not yet initialized');
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
    if (JSON.stringify(this.messageHandler.moderators) !== JSON.stringify(props.moderators)) {
      this.messageHandler.moderators = props.moderators;
    }
    if (JSON.stringify(this.messageHandler.settings) !== JSON.stringify(state.settings)) {
      this.messageHandler.settings = state.settings;
    }
    if (this.messageHandler.nextGameIdx !== state.nextGameIdx ||
    JSON.stringify(this.messageHandler.history) !== JSON.stringify(state.history)) {
      this.messageHandler.previousGames = state.history.slice(0, state.nextGameIdx);
      this.messageHandler.upcomingGames = state.history.slice(state.nextGameIdx);
    }
    // update any custom command terms from settings
    if (state.settings.customJoinCommand) {
      this.messageHandler.updateChatCommandTerm('joinQueue', state.settings.customJoinCommand);
    }
    if (state.settings.customLeaveCommand) {
      this.messageHandler.updateChatCommandTerm('leaveQueue', state.settings.customLeaveCommand);
    }
    return null;
  };

  onMessageHandlerInit = () => {
    if (!this.messageHandler) {return;}
    if (this.state.settings.customJoinCommand ) {
      this.messageHandler?.updateChatCommandTerm('joinQueue', this.state.settings.customJoinCommand);
    }
    if (this.state.settings.customLeaveCommand) {
      this.messageHandler?.updateChatCommandTerm('leaveQueue', this.state.settings.customLeaveCommand);
    }
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
    console.log('MainScreen - onMessage', {message, user, metadata});
    this.twitchApi.updateLastMessageTime(user);
    if (!this.state.userLookup[user] && metadata && metadata['user-id']) {
      this.setState(prevState => ({
        userLookup: Object.assign({}, prevState.userLookup, {[user]: metadata})
      }));
      const userInfo = await this.twitchApi.requestUserInfo({login: user});
      if (userInfo?.data && userInfo?.data[0]) {
        this.props.setChatterInfo(userInfo.data[0]);
      }
    }
  };

  onSettingsUpdate = (nextSettings) => {
    const {settings} = this.state;
    const mergedSettings = Object.assign({}, settings, nextSettings);
    localStorage.setItem('__settings', JSON.stringify(
      mergedSettings
    ));
    console.log('Settings saved:', mergedSettings);
    return this.setState({
      settings: mergedSettings
    }, () => this.updateMessageHandler());
  };

  toggleChangelogModal = () => {
    this.setState((state) => ({
      showChangelogModal: !state.showChangelogModal
    }));
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
    console.log('MainScreen - routePlayRequest');
    const msg = this.state.showPlayerSelect
      ? this.playerSelector?.handleNewPlayerRequest(user, {isPrioritySeat})
      : 'sign-ups are currently closed; try again after this game wraps up!';

    if (sendConfirmationMsg) {
      this.twitchApi?.sendMessage(`/me @${user}, ${msg}`);
    }
  };

  routeLeaveRequest = (user, {sendConfirmationMsg = true}) => {
    const msg = this.playerSelector?.isUserInLobby(user)
      ? 'you have successfully left the lobby'
      : 'you were not in the lobby';

    this.playerSelector?.removeUser(user);

    if (sendConfirmationMsg) {
      this.twitchApi?.sendMessage(`/me @${user}, ${msg}.`);
    }
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

  routeListInterestedQueueRequest = () => {
    this.playerSelector?.listInterestedQueue();
  };

  routeListPlayingQueueRequest = () => {
    return this.playerSelector?.listPlayingQueue();
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
    return window.console.log('MainScreen - sendWhisper: no whisper sent', player, msg);
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
          clearAllQueues={this.routeClearQueueRequest}
          debugItems={this.getOptionsDebugMenu()}
          gamesList={gamesList}
          items={this.getOptionsMenu()}
          onHide={this.toggleOptionsMenu}
          onLogout={this.props.onLogOut}
          onSettingsUpdate={this.onSettingsUpdate}
          parentState={this.state}
          reloadGameList={this.messageHandler?.reloadGameList}
          settings={this.state.settings}
          showOptionsMenu={this.state.showOptionsMenu}
          toggleChangelogModal={this.toggleChangelogModal}
          twitchApi={this.props.twitchApi}
        />
        <div id="content" className="container mx-auto">
          <PlayerQueue
            _game={this.state.history?.[this.state.nextGameIdx]}
            game={GAME_PLACEHOLDER}
            gamesList={gamesList}
            ref={this.setPlayerSelectRef}
            sendMessage={this.twitchApi?.sendMessage}
            sendWhisper={this.sendWhisper}
            settings={this.state.settings}
            startGame={this.startGame}
            twitchApi={this.props.twitchApi}
            userLookup={this.state.userLookup}
          />
        </div>
        <ModalCommandList
          chatCommands={this.messageHandler?.chatCommands || []}
        />
        <ModalChangelog
          handleClose={this.toggleChangelogModal}
          show={this.state.showChangelogModal}
        />
      </div>
    );
  }
}
MainScreen.propTypes = {
  access_token: PropTypes.string,
  channel: PropTypes.string,
  moderators: PropTypes.object,
  onLogOut: PropTypes.func,
  setChatterInfo: PropTypes.func.isRequired,
  // profile_image_url: PropTypes.string,
  setFakeStates: PropTypes.func.isRequired,
  setWhisperStatus: PropTypes.func.isRequired,
  showModalCommandList: PropTypes.func.isRequired,
  twitchApi: PropTypes.object.isRequired,
  // updateUsername: PropTypes.func,
  // userInfo: PropTypes.object,
  // user_id: PropTypes.any,
  // username: PropTypes.string,
};
MainScreen.defaultProps = {
  access_token: null,
  channel: null,
  moderators: null,
  onLogOut: null,
  profile_image_url: null,
  twitchApi: null,
  updateUsername: null,
  userInfo: null,
  user_id: null,
  username: null,
};
const mapStateToProps = state => ({
  modal: state.modal,
  user: state.user
});
const mapDispatchToProps = () => ({
  showModalCommandList,
  setChatterInfo,
  setFakeStates,
  setWhisperStatus,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps()
)(MainScreen);
