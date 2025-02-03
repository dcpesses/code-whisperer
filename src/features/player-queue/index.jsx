import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import PlayerQueueCard from './player-queue-card';
import GameCodeForm from '@/components/game-code-form';
import OnboardingOverlay from '@/features/onboarding';
import {delay, getRelativeTimeString} from '@/utils';
import { addUserToColumn, handleNewPlayerRequest, isUserInLobby, listInterestedQueue, listPlayingQueue, playerCount } from '@/utils/queue';
import {clearQueue, clearRoomCode, closeQueue, incrementRandomCount, openQueue, removeUser, resetRandomCount, setFakeQueueStates, setMaxPlayers, setRoomCode, toggleStreamerSeat, updateColumnForUser} from '@/features/player-queue/queue-slice';
import {DefaultChatCommands} from '@/features/twitch-messages/message-handler';
import { updateMaxSteps } from '../onboarding/onboarding-slice';
import * as fakeStates from '@/components/twitch-wheel/example-states';

import './player-queue.css';

export const noop = () => void 0;

const GAME_PLACEHOLDER = {
  name: '',
  'Min players': 1,
  'Max players': 16,
  username: '',
};

export class PlayerQueue extends Component {
  static get propTypes() {
    return {
      gamesList: PropTypes.object,
      sendMessage: PropTypes.any,
      sendWhisper: PropTypes.any,
      settings: PropTypes.object,
      twitchApi: PropTypes.any.isRequired,
      userLookup: PropTypes.object,

      interested: PropTypes.array,
      playing: PropTypes.array,
      maxPlayers: PropTypes.number,
      roomCode: PropTypes.string,
      streamerSeat: PropTypes.bool,
      randCount: PropTypes.number,
      // dispatch
      clearQueue: PropTypes.func,
      clearRoomCode: PropTypes.func,
      closeQueue: PropTypes.func,
      incrementRandomCount: PropTypes.func,
      openQueue: PropTypes.func,
      removeUser: PropTypes.func,
      resetRandomCount: PropTypes.func,
      setFakeQueueStates: PropTypes.func,
      setMaxPlayers: PropTypes.func,
      setRoomCode: PropTypes.func,
      toggleStreamerSeat: PropTypes.func,
      updateMaxSteps: PropTypes.func.isRequired,
    };
  }
  static get defaultProps() {
    return {
      channelInfo: {},
      gamesList: {},
      sendMessage: {},
      sendWhisper: {},
      settings: {},
      userInfo: {},
      userLookup: {},

      interested: [],
      playing: [],
      joined: [],
      maxPlayers: 8,
      roomCode: null,
      streamerSeat: false,
      isQueueOpen: true,
      randCount: 0,
      // signupMessage: null,
      time: null,

      clearQueue: noop,
      clearRoomCode: noop,
      closeQueue: noop,
      incrementRandomCount: noop,
      openQueue: noop,
      removeUser: noop,
      resetRandomCount: noop,
      setFakeQueueStates: noop,
      setMaxPlayers: noop,
      setRoomCode: noop,
      toggleStreamerSeat: noop,
      updateColumnForUser: noop,
    };
  }
  constructor(props) {
    super(props);

    let joinQueueCommand = DefaultChatCommands.find(cmd => cmd.id === 'joinQueue');
    if (joinQueueCommand?.commands?.[0]) {
      joinQueueCommand = joinQueueCommand.commands[0];
    }

    this.state = {
      time: null
    };
    this.randInt = 0;
    this.timestampInt = 0;
    this.game = GAME_PLACEHOLDER;
  }

  componentDidMount() {
    if (window.location.hash.indexOf('fakestate=true') !== -1) {
      // this.setState(fakeStates.PlayerSelect);
      this.props.setFakeQueueStates(fakeStates.PlayerSelect);
    }
    // used for updating relative times about every 30 secs
    this.timestampInt = setInterval(() => this.setState({ time: Date.now() }), 30000);

    this.props.updateMaxSteps(5);
    return;
  }

  componentWillUnmount() {
    clearInterval(this.randInt);
    clearInterval(this.timestampInt);
    return;
  }

  handleNewPlayerRequest = (username, {isPrioritySeat=false}) => handleNewPlayerRequest(this.props, username, {isPrioritySeat});

  handleRoomCodeChange = (evt) => {
    let roomCode;
    if (typeof evt.target?.value === 'string') {
      roomCode = evt.target.value.trim();
    }
    this.props.setRoomCode(roomCode);
  };

  isUserInLobby = (username) => isUserInLobby(this.props, username);

  addUserToColumn = (user, column) => addUserToColumn(this.props, user, column);

  removeUser = (username) => this.props.removeUser(username);

  clearQueue = () => this.props.clearQueue();

  openQueue = () => this.props.openQueue();

  closeQueue = () => this.props.closeQueue();

  playerCount = () => playerCount(this.props);

  listInterestedQueue = () => listInterestedQueue(this.props);

  listPlayingQueue = () => listPlayingQueue(this.props);

  toggleStreamerSeat = () => this.props.toggleStreamerSeat();

  canStartGame = () => this.props.maxPlayers >= this.playerCount();

  startGame = () => {
    // clear for now; eventually, save elsewhere to report on user play history for that session
    this.props.clearQueue();
    this.props.clearRoomCode();
  };

  initRandomizePlayersAnimation = () => {
    const playerCount = this.playerCount();
    const numPlayersToAdd = Math.min(
      this.props.maxPlayers - playerCount,
      this.props.interested.length
    );
    if (numPlayersToAdd > 0) {
      if (this.props.maxPlayers >= this.props.interested.length + playerCount) {
        // skip animation if no need to randomize
        this.randomizePlayers();
        clearInterval(this.randInt);
        this.props.resetRandomCount();
        return;
      }
      this.randInt = setInterval(this.randomizePlayersAnimation, 50);
      return;
    }
  };

  randomizePlayersAnimation = () => {
    switch (this.props.randCount) {
    case 15:
      this.randomizePlayers();
      clearInterval(this.randInt);
      this.props.resetRandomCount();
      break;
    default:
      this.props.incrementRandomCount();
      break;
    }
  };



  randomizePlayers = () => {
    const numPlayersToAdd = Math.min(
      this.props.maxPlayers - this.playerCount(),
      this.props.interested.length
    );

    let randIdx, randUsername;
    let randIdxArray = [], randUsernameArray = [];
    // let interested = this.props.interested;
    let playing = this.props.playing;

    while (randIdxArray.length < numPlayersToAdd) {
      randIdx = Math.floor(Math.random() * this.props.interested.length);
      if (!randIdxArray.includes(randIdx)) {
        randIdxArray.push(randIdx);
        randUsername = this.props.interested[randIdx].username;
        randUsernameArray.push(randUsername);
        playing = [...playing, this.props.interested[randIdx]];
      }
    }

    this.props.setFakeQueueStates({
      interested: this.props.interested.filter(
        (uObj) => !randUsernameArray.includes(uObj.username)
      ),
      playing
    });
  };

  renderPlayerCard = (userObj, id, curColumn) => {
    if (this.props.userLookup && this.props.userLookup[userObj?.username]) {
      let metadata = this.props.userLookup[userObj.username];
      userObj = Object.assign({}, userObj, metadata);
    }

    let displaySendCodeBtn = !!(this.props.settings?.enableRoomCode && this.props.roomCode);

    let btnProps;

    if (curColumn === 'interested') {
      btnProps = {
        onClick: this.addUserToColumn.bind(this, userObj, 'playing'),
        label: 'Add to Playing'
      };
    }
    if (curColumn === 'playing') {
      btnProps = {
        onClick: this.addUserToColumn.bind(this, userObj, 'interested'),
        label: 'Back to Interested'
      };
    }

    let relativeTime = '';
    if (userObj['tmi-sent-ts']) {
      relativeTime = getRelativeTimeString(parseInt(userObj['tmi-sent-ts'], 10)); // 'xx mins ago'
    }

    return (
      <PlayerQueueCard
        key={`player-queue-card-${userObj.username}`}
        btnProps={btnProps}
        onRemoveUser={this.removeUser.bind(this, userObj.username)}
        onSendCode={this.props.roomCode && this.sendCode.bind(this, userObj)}
        prioritySeat={(userObj.isPrioritySeat === true)}
        queueName={curColumn}
        relativeTime={relativeTime}
        showSendButton={displaySendCodeBtn}
        username={userObj.username}
      />
    );
  };

  renderStreamerSeatToggle = () => {
    return (
      <div className="toggle-streamer-seat">
        <label className="toggle-label form-check-label" htmlFor="reserve-seat-for-streamer">
          Reserve seat for streamer?
        </label>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" role="switch" id="reserve-seat-for-streamer" defaultChecked={this.props.streamerSeat} onChange={this.toggleStreamerSeat} />
        </div>
      </div>
    );
  };

  setMaxPlayers = (val) => this.props.setMaxPlayers(val);

  renderPlayerCount = () => {
    let className = 'player-count';
    if (this.props.maxPlayers < this.playerCount()) {
      className += ' overlimit';
    }
    let maxPlayers = 8;
    if (this.props?.gamesList?.maxPlayersList) {
      const maxPlayerArray = this.props.gamesList.maxPlayersList; //[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const items = maxPlayerArray.map((n) => (
        <Dropdown.Item
          active={n === this.props.maxPlayers}
          eventKey={`max-players-option-${n}`}
          href={null}
          key={`max-players-option-${n}`}
          onClick={this.setMaxPlayers.bind(this, n)}
        >
          {n}
        </Dropdown.Item>
      ));

      maxPlayers = (
        <Dropdown id="dropdown-max-player-seats" drop="down-centered" variant="link" className="d-inline">
          <Dropdown.Toggle id="dropdown-max-player-seats-toggle" variant="link"
            className="link-body-emphasis link-underline-opacity-25 link-underline-opacity-100-hover p-0 m-0 lh-1 align-text-top">
            {this.props.maxPlayers}
          </Dropdown.Toggle>
          <Dropdown.Menu variant="dark">
            <Dropdown.Header>
              Max # of Players
            </Dropdown.Header>
            {items}
          </Dropdown.Menu>
        </Dropdown>
      );
    }
    return (
      <div className={`${className} py-1 px-2`}>
        {this.playerCount()} of {maxPlayers} seats claimed
      </div>
    );
  };

  sendCode = async(userObj) => {
    let player = {
      id: userObj['user-id'],
      username: userObj.username
    };
    if (userObj.isFake === true) { // used with mock demo data
      return await this.props.twitchApi.sendMessage(`Code sent to @${player.username} [MOCK TEST]`);
    }
    return await this.props.sendWhisper(player, this.props.roomCode);
  };

  sendCodeToAll = async() => {
    let {playing, roomCode, settings, twitchApi} = this.props;
    if (!roomCode) {
      return;
    }
    if (playing.length === 0) {
      twitchApi.sendMessage('Sorry, can\'t send the code to 0 players. :p');
      return;
    }

    // TODO: Fix app to properly lookup and recall user info (specifically user ids)
    // prior to sending to all users, which may involve including an api call within
    // queue.addUserToColumn as well as adding something like the following code:

    // workaround to lookup missing user ids
    const requestLogins = playing.map(player => {
      return (!this.props.userLookup?.[player.username])
        ? player
        : null;
    }).filter(m => m).map(p => p.username);

    let respBatchUserInfo = [];
    if (requestLogins.length > 0) {
      try {
        respBatchUserInfo = await twitchApi.requestUserInfoBatch({logins: requestLogins});
        respBatchUserInfo = respBatchUserInfo.data;
      } catch (e) {
        console.warn(e);
      }
    }

    // Merge existing and response user data
    const players = playing.map(player => {
      let lookup = {};
      const respInfo = respBatchUserInfo.find(m => m.login === player.username);
      if (respInfo) {
        lookup = {
          username: respInfo.login,
          'user-id': respInfo.id,
          'display-name': respInfo.display_name,
        };
      } else if (this.props.userLookup?.[player.username]) {
        lookup = this.props.userLookup[player.username];
      }
      return {...player, ...lookup};
    });

    const pipe = (settings?.customDelimiter)
      ? ` ${settings.customDelimiter} `
      : ' ⋆ ';
    const recipients = players.map(user => '@'+user['display-name']).join(pipe);

    let sendingToMsg = 'Sending room code to';
    if (players.length === 1) {
      twitchApi.sendMessage(`${sendingToMsg} 1 person: ${recipients}`);
    } else {
      twitchApi.sendMessage(`${sendingToMsg} ${players.length} people: ${recipients}`);
    }

    let responses = [];
    for (var i = 0; i < players.length; i++) {
      let user = players[i];
      try {
        let resp = await this.sendCode(user);
        responses.push(resp);
      } catch (e) {
        console.warn(e);
      }
      await delay(1000);
    }

    return players;
  };

  render() {
    let {interested, playing, maxPlayers, randCount, roomCode, settings} = this.props;

    const playerCount = this.playerCount();
    let startGameClass = 'btn btn-sm strt-game';
    if (playerCount < this.game?.['Min players']) {
      startGameClass += ' disabled';
    }

    let btnRandomizeLabel = 'Randomize';
    if (maxPlayers >= interested.length + playerCount) {
      btnRandomizeLabel = 'Add All to Playing';
    }

    const joinCommand = settings?.customJoinCommand || '!join';

    // step 1
    const stepInterested = (
      <>
        People who want to play will type the <b>{joinCommand}</b> command in chat; those users will be listed in the Interested section.
      </>
    );

    // step 2
    const stepMaxPlayers = (
      <>
        Set the maximum number of playable spots if your game has a limit, or leave it at <b><tt>0</tt></b> to disable the count.
      </>
    );

    // step 3
    const stepPlaying = (
      <>
        Then, <b>you</b> chose who you want to join the game; those users will be listed in the Playing section.
      </>
    );

    // step 4
    const stepSendQueue = (
      <>
        Lastly, enter the room code you want to send to everyone in the Playing queue. To whisper them, press <b>SEND&nbsp;TO&nbsp;QUEUE</b>.
      </>
    );

    // Step 5
    const stepOptionsMenu = (
      <>
        You can find this walkthrough again
        along with many other available
        settings in the <b>Options</b> menu
      </>
    );

    return (
      <div className="queues d-flex flex-column flex-md-row my-2 flex-wrap" data-timestamp={this.state.time}>
        <div className="queue my-1 px-md-1 col-12">
          <OnboardingOverlay placement="bottom" step={4} content={stepSendQueue}>
            <GameCodeForm
              value={roomCode || ''}
              onInputChange={this.handleRoomCodeChange}
              onSendToAll={this.sendCodeToAll}
              disabled={playing.length===0 || !roomCode}
            />
          </OnboardingOverlay>
        </div>

        <div className="queue my-1 px-md-1 col-12">
          <div className="bg-body rounded shadow-sm p-2 d-flex justify-content-between">

            {this.renderStreamerSeatToggle()}


            <OnboardingOverlay placement="bottom" step={2} content={stepMaxPlayers}
              className="fs-6 lh-sm align-self-center">
              {this.renderPlayerCount()}
            </OnboardingOverlay>


          </div>
        </div>

        <div className="queue my-1 px-md-1 col-12 col-md-6 order-2 order-md-1">
          <OnboardingOverlay step={1} content={stepInterested}>
            <div className="bg-body rounded shadow-sm p-2">
              <h6 className="pb-2 m-2 mb-0 libre-franklin-font text-dark-emphasis text-uppercase clearfix d-flex align-items-bottom">
                <span className="queue-header me-auto align-self-center">
                  <i className="bi-people text-purple-1 fs-5" /> Interested
                </span>

                <button className="btn btn-sm" onClick={this.initRandomizePlayersAnimation}>
                  {btnRandomizeLabel}
                </button>
              </h6>
              <div className={`d-flex flex-column text-body interested-queue rand-${randCount}`}>

                {interested.filter((iObj) => iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'interested') )}
                {interested.filter((iObj) => !iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'interested') )}

              </div>
            </div>
          </OnboardingOverlay>
        </div>


        <div className="queue my-1 px-md-1 col-12 col-md-6 order-1 order-md-2">
          <OnboardingOverlay className="bg-body rounded shadow-sm p-2" step={3} content={stepPlaying}>

            <h6 className="pb-2 m-2 mb-0 libre-franklin-font text-dark-emphasis text-uppercase clearfix d-flex align-items-bottom">
              <span className="queue-header me-auto align-self-center">
                <i className="bi-people-fill text-purple-1 fs-5" /> Playing
              </span>

              <button className={startGameClass} onClick={this.startGame} disabled={!this.canStartGame()}>
                Clear Seats
              </button>
            </h6>
            <div className="d-flex flex-column text-body playing-queue">

              {playing.filter((iObj) => iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'playing') )}
              {playing.filter((iObj) => !iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'playing') )}

            </div>


          </OnboardingOverlay>
        </div>


        <OnboardingOverlay className="queue-walkthrough-reminder pe-none" step={5} placement="bottom" content={stepOptionsMenu}>
          <span className="navbar-toggler-icon invisible" />
        </OnboardingOverlay>

      </div>
    );
  }
}

const mapStateToProps = state => ({
  channelInfo: state.channel.user,
  userInfo: state.user.info,
  userLookup: state.channel.lookup,
  // queue related
  interested: state.queue.interested,
  playing: state.queue.playing,
  joined: state.queue.joined,
  maxPlayers: state.queue.maxPlayers,
  roomCode: state.queue.roomCode,
  streamerSeat: state.queue.streamerSeat,
  isQueueOpen: state.queue.isQueueOpen,
  randCount: state.queue.randCount,
  signupMessage: state.queue.signupMessage,
  settings: state.settings.app,
});
const mapDispatchToProps = () => ({
  clearQueue,
  clearRoomCode,
  closeQueue,
  incrementRandomCount,
  openQueue,
  removeUser,
  resetRandomCount,
  setFakeQueueStates,
  setMaxPlayers,
  setRoomCode,
  toggleStreamerSeat,
  updateColumnForUser,
  updateMaxSteps,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps(),
  null,
  { forwardRef: true }
)(PlayerQueue);
