/* eslint-disable no-console */

import {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Button, Modal} from 'react-bootstrap';
import MessageHandler from '@/features/twitch-messages/message-handler';
import HeaderMenu from '@/features/header-menu';
import PlayerQueue from '@/features/player-queue';
import ModalChangelog from '@/features/modal-changelog';
import ModalCommandList from '@/features/modal-command-list';
import { showModalCommandList } from '@/features/modal-command-list/modalSlice';
import { setFakeUserStates, setChatterInfo, setWhisperStatus } from '@/features/player-queue/user-slice.js';
import { showOnboarding } from '@/features/onboarding/onboarding-slice.js';
import {
  clearQueue, clearRoomCode, closeQueue, incrementRandomCount, openQueue, removeUser, resetRandomCount,
  setFakeQueueStates, setMaxPlayers, setRoomCode, toggleStreamerSeat, updateColumnForUser
} from '@/features/player-queue/queue-slice';
import { listInterestedQueue, listPlayingQueue, routeJoinRequest, routeLeaveRequest } from '@/utils/queue';
import { setFakeChannelStates, setUserLookup } from '@/features/twitch/channel-slice';
import { LOCALSETTINGS_KEY, setFakeSettingsStates, updateAppSettings } from '@/features/twitch/settings-slice';
import * as fakeStates from '../twitch-wheel/example-states';

import {version} from '../../../package.json';

import './main-screen.css';

export const noop = () => void 0;

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

export class MainScreen extends Component {
  constructor(props) {
    super(props);

    let settings = Object.assign({enableRoomCode: true}, props.settings);

    try {
      const isJestEnv = (import.meta.env.VITEST_WORKER_ID !== undefined);
      const savedSettings = localStorage.getItem(LOCALSETTINGS_KEY);
      if (savedSettings) {
        settings = Object.assign({}, settings, JSON.parse(savedSettings));
        this.props.updateAppSettings(settings);
        if (!isJestEnv) {
          console.log('Saved settings updated in store!');
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
      showChangelogModal: (lastVersion && lastVersion !== version),
      showOnboardingPromptModal: (!lastVersion),
      showOptionsMenu: false,
      showOptionsModal: false,
      userLookup: {},
      activeChannel: null,
    };

    this.playerSelector = null;
    this.messageHandler = null;

    this.onMessage = this.onMessage.bind(this);
    this.routePlayRequest = this.routePlayRequest.bind(this);
    this.routeLeaveRequest = this.routeLeaveRequest.bind(this);
    this.routeOpenQueueRequest = this.routeOpenQueueRequest.bind(this);
    this.routeCloseQueueRequest = this.routeCloseQueueRequest.bind(this);
    this.routeClearQueueRequest = this.routeClearQueueRequest.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.sendWhisper = this.sendWhisper.bind(this);

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
      this.props.setFakeUserStates(fakeStates.UserStore);
      this.props.setFakeChannelStates({lookup: fakeStates.MainScreen.userLookup});
      this.props.setFakeSettingsStates({app: fakeStates.SettingsStore.app});
    }
  }
  componentDidUpdate = (prevProps) => {
    if (prevProps.twitchApi?.isChatConnected !== this.props.twitchApi?.isChatConnected
      || !this.messageHandler && this.props.twitchApi?.isChatConnected) {
      this.messageHandler = this.initMessageHandler();
    } else if (this.props.twitchApi?.isChatConnected) {
      this.updateMessageHandler(this.props, this.state);

      // remove any custom command terms if necessary
      if (!this.props.settings?.customJoinCommand && prevProps.settings?.customJoinCommand) {
        console.log('calling updateChatCommandTerm(joinQueue)');
        this.messageHandler.updateChatCommandTerm('joinQueue', this.props.settings.customJoinCommand);
      }
      if (!this.props.settings?.customLeaveCommand && prevProps.settings?.customLeaveCommand) {
        console.log('calling updateChatCommandTerm(leaveQueue)');
        this.messageHandler.updateChatCommandTerm('leaveQueue', this.props.settings.customLeaveCommand);
      }
      if (!this.props.settings?.customQueueCommand && prevProps.settings?.customQueueCommand) {
        console.log('calling updateChatCommandTerm(listQueue)');
        this.messageHandler.updateChatCommandTerm('listQueue', this.props.settings.customQueueCommand);
      }
      // TODO: check if needed here
      // if (!this.props.settings?.enableRestrictedListQueue && prevProps.settings?.enableRestrictedListQueue
      // || this.props.settings?.enableRestrictedListQueue !== prevProps.settings?.enableRestrictedListQueue
      // ) {
      //   console.log('calling updateChatCommand(listQueue)');
      //   this.messageHandler.updateChatCommand('listQueue', 'mod', this.props.settings.enableRestrictedListQueue);
      // }
    }
  };

  initMessageHandler = () => {
    // console.log('initMessageHandler');
    if (!this.props.twitchApi?.isChatConnected) {
      console.log('main-screen - initMessageHandler: cannot init; no chat client available');
      return null;
    }
    let messageHandler = new MessageHandler({
      access_token: this.props.access_token,
      channel: this.props.channel,
      clearQueueHandler: this.routeClearQueueRequest.bind(this),
      closeQueueHandler: this.routeCloseQueueRequest.bind(this),
      joinQueueHandler: this.routePlayRequest.bind(this),
      listQueueHandler: this.routeListPlayingQueueRequest.bind(this),
      logUserMessages: this.state.logUserMessages,
      messages: this.state.messages,
      moderators: this.props.moderators,
      onMessageCallback: this.onMessage.bind(this),
      onSettingsUpdate: this.onSettingsUpdate.bind(this),
      openQueueHandler: this.routeOpenQueueRequest.bind(this),
      playerExitHandler: this.routeLeaveRequest.bind(this),
      settings: this.props.settings,
      // startGame: this.startGame.bind(this),
      twitchApi: this.props.twitchApi,
    });

    messageHandler.client = this.props.twitchApi._chatClient;
    this.props.twitchApi.onMessage = messageHandler.onMessage;
    if (this.props.settings?.customJoinCommand ) {
      messageHandler.updateChatCommandTerm('joinQueue', this.props.settings.customJoinCommand);
    }
    if (this.props.settings?.customLeaveCommand) {
      messageHandler.updateChatCommandTerm('leaveQueue', this.props.settings.customLeaveCommand);
    }
    if (this.props.settings?.customQueueCommand) {
      messageHandler.updateChatCommandTerm('listQueue', this.props.settings.customQueueCommand);
    }
    if (typeof this.props.settings?.enableRestrictedListQueue === 'boolean') {
      messageHandler.updateChatCommand('listQueue', 'mod', this.props.settings.enableRestrictedListQueue);
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
        if (this.debug || this.state.logUserMessages) {
          console.log('main-screen - updateMessageHandler: cannot update, chat not yet initialized');
        }
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
    if (JSON.stringify(this.messageHandler.settings) !== JSON.stringify(props.settings)) {
      this.messageHandler.settings = props.settings;
    }

    // update any custom command terms from settings
    if (props.settings.customJoinCommand) {
      this.messageHandler.updateChatCommandTerm('joinQueue', props.settings.customJoinCommand);
    }
    if (props.settings.customLeaveCommand) {
      this.messageHandler.updateChatCommandTerm('leaveQueue', props.settings.customLeaveCommand);
    }
    if (props.settings.customQueueCommand) {
      this.messageHandler.updateChatCommandTerm('listQueue', props.settings.customQueueCommand);
    }
    if (typeof props.settings.enableRestrictedListQueue === 'boolean') {
      this.messageHandler.updateChatCommand('listQueue', 'mod', props.settings.enableRestrictedListQueue);
    }
    return null;
  };

  onMessageHandlerInit = () => {
    if (!this.messageHandler) {return;}
    if (this.props.settings?.customJoinCommand) {
      this.messageHandler?.updateChatCommandTerm('joinQueue', this.props.settings.customJoinCommand);
    }
    if (this.props.settings?.customLeaveCommand) {
      this.messageHandler?.updateChatCommandTerm('leaveQueue', this.props.settings.customLeaveCommand);
    }
    if (this.props.settings?.customQueueCommand) {
      this.messageHandler?.updateChatCommandTerm('listQueue', this.props.settings.customQueueCommand);
    }
    if (typeof this.props.settings?.enableRestrictedListQueue === 'boolean') {
      this.messageHandler?.updateChatCommand('listQueue', 'mod', this.props.settings.enableRestrictedListQueue);
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
      label: 'Load Mock Player Requests',
      onClick: () => {
        this.props.setFakeQueueStates(fakeStates.PlayerSelect);
        this.props.setFakeUserStates(fakeStates.UserStore);
        this.props.setFakeChannelStates({lookup: fakeStates.MainScreen.userLookup});
        return;
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

  handleOpenModalCommandList = () => this.props.showModalCommandList();

  onMessage = async(message, user, metadata) => {
    if (this.debug || this.state.logUserMessages) {
      window.console.log('MainScreen - onMessage', {message, user, metadata});
    }
    this.twitchApi.updateLastMessageTime(user);
    try {
      if (!this.props.userLookup[user] && metadata?.['user-id']) {
        this.props.setUserLookup(metadata);
        const userInfo = await this.twitchApi.requestUserInfo({login: user});
        if (userInfo?.data?.[0]) {
          this.props.setChatterInfo(userInfo.data[0]);
        }
      }
    } catch (e) {
      console.error('MainScreen - onMessage Error:', e);
    }

  };

  onSettingsUpdate = (nextSettings) => {
    const {settings} = this.state;
    const mergedSettings = Object.assign({}, settings, nextSettings);
    try {
      localStorage.setItem('__settings', JSON.stringify(mergedSettings));
      this.props.updateAppSettings(mergedSettings);
      if (this.debug || this.state.logUserMessages) {console.log('Settings updated:', mergedSettings);}
      return this.updateMessageHandler();
    } catch (e) {
      window.console.warn(e);
    }
  };

  onShowOnboarding = () => {
    this.toggleOnboardingPromptModal();
    this.props.showOnboarding();
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

  toggleOnboardingPromptModal = () => {
    this.setState((state) => ({
      showOnboardingPromptModal: !state.showOnboardingPromptModal
    }));
  };

  routePlayRequest = (user, {sendConfirmationMsg = true, isPrioritySeat = false}) =>
    routeJoinRequest(this.props, user, {sendConfirmationMsg, isPrioritySeat});

  routeLeaveRequest = (user, {sendConfirmationMsg = true}) => routeLeaveRequest(this.props, user, {sendConfirmationMsg});

  routeOpenQueueRequest = () => this.props.openQueue();

  routeCloseQueueRequest = () => this.props.closeQueue();

  routeClearQueueRequest = () => this.props.clearQueue();

  routeListInterestedQueueRequest = () => listInterestedQueue(this.props);

  routeListPlayingQueueRequest = () => listPlayingQueue(this.props);

  sendMessage = (msg) => this.props.twitchApi?.sendMessage(msg);

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
      return true;
    }
    if (this.debug || this.state.logUserMessages) {window.console.log('MainScreen - sendWhisper: no whisper sent', player, msg);}
    return;
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
          showOptionsMenu={this.state.showOptionsMenu}
          toggleChangelogModal={this.toggleChangelogModal}
          twitchApi={this.props.twitchApi}
        />
        <div id="content" className="container mx-auto">
          <PlayerQueue
            _game={this.state.history?.[this.state.nextGameIdx]}
            game={GAME_PLACEHOLDER}
            gamesList={gamesList}
            sendMessage={this.twitchApi?.sendMessage}
            sendWhisper={this.sendWhisper}
            twitchApi={this.props.twitchApi}
            userLookup={this.props.userLookup}
          />
        </div>
        <ModalCommandList
          chatCommands={this.messageHandler?.chatCommands}
        />
        <ModalChangelog
          handleClose={this.toggleChangelogModal}
          show={this.state.showChangelogModal}
        />
        <Modal
          aria-labelledby="onboarding-prompt-modal-title"
          centered
          onHide={this.toggleOnboardingPromptModal}
          show={this.state.showOnboardingPromptModal}
        >
          <Modal.Header closeButton>
            <Modal.Title id="onboarding-prompt-modal-title" className="fs-bolder">
              Welcome<span className="d-none d-xs-inline"> to Code Whisperer</span>!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <h4 className="mb-3">Psst!</h4>
            <p className="lh-base mb-3">
              Wanna see a brief walkthrough on how to use this thing?
            </p>
            <p className="lh-base mb-3">
              If not, no worries, you can always view it later under <b className="d-inline-block">Options &rarr; View Walkthrough</b>.
            </p>
          </Modal.Body>
          <Modal.Footer className="text-center d-block">
            <Button variant="secondary" onClick={this.toggleOnboardingPromptModal}>No thanks.</Button>
            <Button variant="primary" onClick={this.onShowOnboarding}>Yes please!</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
MainScreen.propTypes = {
  access_token: PropTypes.string,
  channel: PropTypes.string,
  clearQueue: PropTypes.func,
  closeQueue: PropTypes.func,
  moderators: PropTypes.array,
  onLogOut: PropTypes.func,
  openQueue: PropTypes.func,
  setChatterInfo: PropTypes.func.isRequired,
  setFakeChannelStates: PropTypes.func.isRequired,
  setFakeQueueStates: PropTypes.func.isRequired,
  setFakeSettingsStates: PropTypes.func.isRequired,
  setFakeUserStates: PropTypes.func.isRequired,
  setUserLookup: PropTypes.func.isRequired,
  setWhisperStatus: PropTypes.func.isRequired,
  settings: PropTypes.object,
  showModalCommandList: PropTypes.func.isRequired,
  showOnboarding: PropTypes.func.isRequired,
  twitchApi: PropTypes.object.isRequired,
  updateAppSettings: PropTypes.func.isRequired,
  userLookup: PropTypes.object,
};
MainScreen.defaultProps = {
  access_token: null,
  channel: null,
  moderators: null,
  onLogOut: null,
  profile_image_url: null,
  settings: {},
  twitchApi: null,
  updateUsername: null,
  userInfo: null,
  userLookup: {},
  user_id: null,
  username: null,

  isQueueOpen: true,

  clearQueue: noop,
  clearRoomCode: noop,
  closeQueue: noop,
  incrementRandomCount: noop,
  openQueue: noop,
  removeUser: noop,
};
const mapStateToProps = state => ({
  modal: state.modal,
  interested: state.queue.interested,
  playing: state.queue.playing,
  isQueueOpen: state.queue.isQueueOpen,
  settings: state.settings.app,
  streamerSeat: state.queue.streamerSeat,
  userLookup: state.channel.lookup,
  user: state.user,
});
const mapDispatchToProps = () => ({
  showModalCommandList,
  setChatterInfo,
  setFakeChannelStates,
  setFakeQueueStates,
  setFakeSettingsStates,
  setFakeUserStates,
  setUserLookup,
  setWhisperStatus,
  updateAppSettings,

  clearQueue,
  clearRoomCode,
  closeQueue,
  incrementRandomCount,
  openQueue,
  removeUser,
  resetRandomCount,
  routeJoinRequest,
  routeLeaveRequest,
  setMaxPlayers,
  setRoomCode,
  toggleStreamerSeat,
  updateColumnForUser,
  showOnboarding,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps()
)(MainScreen);
