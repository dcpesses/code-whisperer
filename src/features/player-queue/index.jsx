import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import PlayerQueueCard from './player-queue-card';
import GameCodeForm from '@/components/game-code-form';
import {getRelativeTimeString} from '@/utils';
import * as fakeStates from '@/components/twitch-wheel/example-states';

import './player-queue.css';

const GAME_PLACEHOLDER = {
  name: '',
  'Min players': 1,
  'Max players': 16,
  username: '',
};
export default class PlayerQueue extends Component {
  static get propTypes() {
    return {
      gamesList: PropTypes.object,
      sendMessage: PropTypes.any,
      sendWhisper: PropTypes.any,
      settings: PropTypes.object,
      twitchApi: PropTypes.any.isRequired,
      userLookup: PropTypes.any,
    };
  }
  static get defaultProps() {
    return {
      gamesList: {},
      userLookup: {},
      settings: {},
      sendWhisper: {},
      sendMessage: {},
    };
  }
  constructor(props) {
    super(props);
    this.firstColumn = React.createRef();
    this.state = {
      interested: [],
      playing: [],
      maxPlayers: 8,
      roomCode: null,
      sentCodeStatus: {},
      streamerSeat: false,
      isQueueOpen: true,
      randCount: 0
    };
    this.randInt = 0;
    this.timestampInt = 0;
    this.game = GAME_PLACEHOLDER;
  }

  componentDidMount() {
    if (window.location.hash.indexOf('fakestate=true') !== -1) {
      this.setState(fakeStates.PlayerSelect);
    }
    // used for updating relative times about every 30 secs
    this.timestampInt = setInterval(() => this.setState({ time: Date.now() }), 30000);
    return;
  }

  componentWillUnmount() {
    clearInterval(this.randInt);
    clearInterval(this.timestampInt);
    return;
  }


  handleNewPlayerRequest = (username, {isPrioritySeat=false}) => {
    if (isPrioritySeat) {
      // even if the queue is closed, still add them to the interested column for consideration
      const column = (this.state.isQueueOpen ? 'playing' : 'interested');

      return this.updateColumnForUser({username, isPrioritySeat}, column)
        ? 'you have been successfully added to the lobby.'
        : 'there was an error adding you to the lobby.';
    }

    if (this.state?.interested?.map((uObj) => uObj.username)?.includes(username)
        || this.state?.playing?.map((uObj) => uObj.username)?.includes(username)) {
      return 'you are already in the lobby.';
    }

    if (!this.state.isQueueOpen) {
      return 'the queue is currently closed; users have already been selected for this game.';
    }
    return this.updateColumnForUser({username}, 'interested')
      ? 'you have successfully joined the lobby.'
      : 'there was an error adding you to the lobby.';
  };

  handleRoomCodeChange = (evt) => {
    let roomCode;
    if (evt.target?.value) {
      roomCode = evt.target.value.trim();
    }
    this.setState({roomCode});
  };

  updateColumnForUser = (userObj, newColumn) => {
    if (!this.state || !this.state[newColumn]) {return false;}

    this.removeUser(userObj.username);
    this.setState((prevState) => ({
      ...prevState,
      [newColumn]: [
        ...prevState[newColumn],
        userObj
      ]
    }));
    return true;
  };

  removeUser = (username) => {
    return this.setState((prevState) => ({
      ...prevState,
      interested: prevState.interested.filter((iObj) => iObj.username !== username),
      playing: prevState.playing.filter((pObj) => pObj.username !== username)
    }));
  };

  clearQueue = () => {
    return this.setState((prevState) => ({
      ...prevState,
      interested: [],
      playing: []
    }));
  };

  openQueue = () => {
    return this.setState((prevState) => ({
      ...prevState,
      isQueueOpen: true
    }));
  };

  closeQueue = () => {
    return this.setState((prevState) => ({
      ...prevState,
      isQueueOpen: false
    }));
  };

  playerCount = () => {
    return this.state.playing.length
      + (this.state.streamerSeat ? 1 : 0);
  };

  toggleStreamerSeat = () => {
    this.setState((prevState) => ({
      ...prevState,
      streamerSeat: !prevState.streamerSeat
    }));
  };

  canStartGame = () => this.state.maxPlayers >= this.playerCount();

  startGame = () => {
    // clear for now; eventually, save elsewhere to report on user play history for that session
    this.setState ((prevState) => ({
      ...prevState,
      interested: [],
      playing: [],
      roomCode: null
    }));
    // this.props.startGame();
  };

  initRandomizePlayersAnimation = () => {
    const numPlayersToAdd = Math.min(
      this.state.maxPlayers - this.playerCount(),
      this.state.interested.length
    );
    if (numPlayersToAdd > 0) {
      this.randInt = setInterval(this.randomizePlayersAnimation, 50);
      return;
    }
  };

  randomizePlayersAnimation = () => {
    switch (this.state.randCount) {
    case 15:
      this.randomizePlayers();
      clearInterval(this.randInt);
      this.setState({
        randCount: 0
      });
      break;
    default:
      this.setState(
        (prevState) => ({
          randCount: prevState.randCount + 1
        })
      );
      break;
    }
  };



  randomizePlayers = () => {
    const numPlayersToAdd = Math.min(
      this.state.maxPlayers - this.playerCount(),
      this.state.interested.length
    );

    let randIdx, randUsername;
    let randIdxArray = [], randUsernameArray = [];
    // let interested = this.state.interested;
    let playing = this.state.playing;

    while (randIdxArray.length < numPlayersToAdd) {
      randIdx = Math.floor(Math.random() * this.state.interested.length);
      if (!randIdxArray.includes(randIdx)) {
        randIdxArray.push(randIdx);
        randUsername = this.state.interested[randIdx].username;
        randUsernameArray.push(randUsername);
        playing = [
          ...playing,
          this.state.interested[randIdx]
        ];
      }
    }
    this.setState((prevState) => ({
      interested: prevState.interested.filter((uObj) => !randUsernameArray.includes(uObj.username)),
      playing
    }));
  };

  renderPlayerCard = (userObj, id, curColumn) => {
    if (this.props.userLookup && this.props.userLookup[userObj?.username]) {
      let metadata = this.props.userLookup[userObj.username];
      userObj = Object.assign({}, userObj, metadata);
    }

    let displaySendCodeBtn = !!(this.props.settings?.enableRoomCode && this.state.roomCode);

    let btnProps;

    if (curColumn === 'interested') {
      btnProps = {
        onClick: this.updateColumnForUser.bind(this, userObj, 'playing'),
        label: 'Add to Playing'
      };
    }
    if (curColumn === 'playing') {
      btnProps = {
        onClick: this.updateColumnForUser.bind(this, userObj, 'interested'),
        label: 'Back to Interested'
      };
    }

    let relativeTime = '';
    if (userObj['tmi-sent-ts']) {
      relativeTime = getRelativeTimeString(parseInt(userObj['tmi-sent-ts'], 10)); // 'xx mins ago'
    }

    return (
      <PlayerQueueCard
        key={`player-queue-card-${id}`}
        btnProps={btnProps}
        onRemoveUser={this.removeUser.bind(this, userObj.username)}
        onSendCode={this.state.roomCode && this.sendCode.bind(this, userObj)}
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
          <input className="form-check-input" type="checkbox" role="switch" id="reserve-seat-for-streamer" defaultChecked={this.state.streamerSeat} onChange={this.toggleStreamerSeat} />
        </div>
      </div>
    );
  };

  setMaxPlayers = (val) => {
    this.setState({
      maxPlayers: val
    });
  };

  renderPlayerCount = () => {
    let className = 'player-count';
    if (this.state.maxPlayers < this.playerCount()) {
      className += ' overlimit';
    }
    let maxPlayers = 8;
    if (this.props?.gamesList?.maxPlayersList) {
      const maxPlayerArray = this.props.gamesList.maxPlayersList; //[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const items = maxPlayerArray.map((n) => (
        <Dropdown.Item
          active={n === this.state.maxPlayers}
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
            {this.state?.maxPlayers}
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
      <div className={className}>
        {this.playerCount()} of {maxPlayers} seats claimed
      </div>
    );
  };

  sendCode = async(userObj) => {
    let player = {
      id: userObj['user-id'],
      username: userObj.username
    };
    return await this.props.sendWhisper(player, this.state.roomCode);
  };

  sendCodeToAll = () => {
    if (!this.state.roomCode) {
      return;
    }
    if (this.state.playing.length === 0) {
      this.props.twitchApi.sendMessage('Sorry, can\'t send the code to 0 players. :p');
      return;
    }
    const pipe = (this.props.settings?.customDelimiter)
      ? ` ${this.props.settings.customDelimiter} `
      : ' ⋆ ';
    const recipients = this.state.playing.map(p => '@'+p['display-name']).join(pipe);
    let sendingToMsg = 'Sending room code to';
    if (this.state.playing.length === 1) {
      this.props.twitchApi.sendMessage(`${sendingToMsg} 1 person: ${recipients}`);
    } else {
      this.props.twitchApi.sendMessage(`${sendingToMsg} ${this.state.playing.length} people: ${recipients}`);
    }

    return this.state.playing.forEach((userObj, i) => {
      // this.sendCodeToEach(i, userObj, this.state.roomCode, this.props);
      (function(i, userObj, sendCode) {
        setTimeout(() => {
          return sendCode(userObj);
        }, 1000 * (i+1));
      }(i, userObj, this.sendCode));
    });
  };

  render() {
    let startGameClass = 'btn btn-sm strt-game';
    if (this.playerCount() < this.game?.['Min players']) {
      startGameClass += ' disabled';
    }

    return (
      <div className="queues d-flex flex-column flex-md-row my-2 flex-wrap">
        <div className="queue my-1 px-md-1 col-12">
          <GameCodeForm
            value={this.state.roomCode || ''}
            onInputChange={this.handleRoomCodeChange}
            onSendToAll={this.sendCodeToAll}
            disabled={this.state.playing.length===0 || !this.state.roomCode}
          />
        </div>

        <div className="queue my-1 px-md-1 col-12">
          <div className="bg-body rounded shadow-sm p-2 d-flex justify-content-between">

            {this.renderStreamerSeatToggle()}

            <div className="fs-6 lh-sm align-self-center">
              {this.renderPlayerCount()}
            </div>

          </div>
        </div>

        <div className="queue my-1 px-md-1 col-12 col-md-6 order-2 order-md-1">
          <div className="bg-body rounded shadow-sm p-2">
            <h6 className="pb-2 m-2 mb-0 libre-franklin-font text-dark-emphasis text-uppercase clearfix d-flex align-items-bottom">
              <span className="queue-header me-auto align-self-center">
                <i className="bi-people text-purple-1 fs-5" /> Interested
              </span>

              <button className="btn btn-sm" onClick={this.initRandomizePlayersAnimation}>
                Randomize
              </button>
            </h6>
            <div className={`d-flex flex-column text-body interested-queue rand-${this.state.randCount}`}>

              {this.state.interested.filter((iObj) => iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'interested') )}
              {this.state.interested.filter((iObj) => !iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'interested') )}

            </div>
          </div>
        </div>


        <div className="queue my-1 px-md-1 col-12 col-md-6 order-1 order-md-2">
          <div className="bg-body rounded shadow-sm p-2">
            <h6 className="pb-2 m-2 mb-0 libre-franklin-font text-dark-emphasis text-uppercase clearfix d-flex align-items-bottom">
              <span className="queue-header me-auto align-self-center">
                <i className="bi-people-fill text-purple-1 fs-5" /> Playing
              </span>

              <button className={startGameClass} onClick={this.startGame} disabled={!this.canStartGame()}>
                Clear Seats
              </button>
            </h6>
            <div className="d-flex flex-column text-body playing-queue">

              {this.state.playing.filter((iObj) => iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'playing') )}
              {this.state.playing.filter((iObj) => !iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'playing') )}

            </div>

          </div>
        </div>

      </div>
    );
  }
}
