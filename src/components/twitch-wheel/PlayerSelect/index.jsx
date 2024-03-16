import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {getRelativeTimeString} from '@/utils';
import * as fakeStates from '@/components/twitch-wheel/example-states';

import './PlayerQueue.css';

const GAME_PLACEHOLDER = {
  name: '',
  'Min players': 1,
  'Max players': 16,
  username: '',
};
export default class PlayerQueue extends Component {
  static get propTypes() {
    return {
      sendMessage: PropTypes.any,
      sendWhisper: PropTypes.any,
      settings: PropTypes.object,
      twitchApi: PropTypes.any.isRequired,
      userLookup: PropTypes.any,
    };
  }
  static get defaultProps() {
    return {
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
      roomCode: null,
      sentCodeStatus: {},
      streamerSeat: false,
      isQueueOpen: true,
      randCount: 0
    };
    this.randInt = 0;

    this.game = GAME_PLACEHOLDER;
  }

  componentDidMount() {
    if (window.location.hash.indexOf('fakestate=true') !== -1) {
      this.setState(fakeStates.PlayerSelect);
    }
    return;
  }

  componentWillUnmount() {
    clearInterval(this.randInt);
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
  handleRoomCodeFocus = (evt) => evt.target.select();

  updateColumnForUser = (userObj, newColumn) => {
    if (!this.state || !this.state[newColumn]) {return false;}

    this.removeUser(userObj.username);
    this.setState((state) => {
      return {
        ...state,
        [newColumn]: [
          ...state[newColumn],
          userObj
        ]
      };
    });
    return true;
  };

  removeUser = (username) => {
    return this.setState((state) => ({
      ...state,
      interested: state.interested.filter((iObj) => iObj.username !== username),
      playing: state.playing.filter((pObj) => pObj.username !== username)
    }));
  };

  clearQueue = () => {
    return this.setState((state) => {
      return {
        ...state,
        interested: [],
        playing: []
      };
    });
  };

  openQueue = () => {
    return this.setState((state) => {
      return {
        ...state,
        isQueueOpen: true
      };
    });
  };

  closeQueue = () => {
    return this.setState((state) => {
      return {
        ...state,
        isQueueOpen: false
      };
    });
  };

  playerCount = () => {
    return this.state.playing.length
      + (this.state.streamerSeat ? 1 : 0);
  };

  toggleStreamerSeat = () => {
    this.setState((state) => {
      return {
        ...state,
        streamerSeat: !state.streamerSeat
      };
    });
  };

  canStartGame = () => {
    return this.game?.['Max players'] >= this.playerCount() &&
      this.game?.['Min players'] <= this.playerCount();
  };

  startGame = () => {
    // clear for now; eventually, save elsewhere to report on user play history for that session
    this.setState ((state) => {
      return {
        ...state,
        interested: [],
        playing: [],
        roomCode: null
      };
    });
    // this.props.startGame();
  };

  initRandomizePlayersAnimation = () => {
    const numPlayersToAdd = Math.min(
      this.game['Max players'] - this.playerCount(),
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
      this.game['Max players'] - this.playerCount(),
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
    this.setState((state) => ({
      interested: state.interested.filter((uObj) => !randUsernameArray.includes(uObj.username)),
      playing
    }));
  };

  renderPlayerCard = (userObj, id, curColumn) => {
    if (this.props.userLookup && this.props.userLookup[userObj?.username]) {
      let metadata = this.props.userLookup[userObj.username];
      userObj = Object.assign({}, userObj, metadata);
    }

    let displaySendCodeBtn = (this.props.settings?.enableRoomCode && this.state.roomCode !== null);

    let btnSendCode;

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
      if (displaySendCodeBtn) {
        btnSendCode = (
          <button className="btn btn-sm btn-info send-code" onClick={ this.sendCode.bind(this, userObj) } disabled={!this.state.roomCode}>Send</button>
        );
      }
    }

    let usernameColorClassName = 'text-body-emphasis';
    let redemptionIndicator;
    if (userObj.isPrioritySeat === true) {
      usernameColorClassName = 'text-warning-emphasis';
      redemptionIndicator = (
        <span title="Priority seat redemption" className="align-self-center">&#9733;</span>
      );
    }

    let relativeTime = '';
    if (userObj['tmi-sent-ts']) {
      relativeTime = getRelativeTimeString(parseInt(userObj['tmi-sent-ts'], 10)); // 'xx mins ago'
    }

    return (
      <div key={`game-queue-player-${id}`} className="game-queue-player p-2 mb-0 small lh-1 border-bottom w-100 raleway-font fw-medium border rounded bg-dark-subtle">
        <div className="d-flex justify-content-between">
          <div className="d-flex flex-row">
            <button className="btn btn-sm btn-link text-decoration-none p-1 lh-1" onClick={this.removeUser.bind(this, userObj.username)} title="Remove">&#128683;</button>
            {' '}
            <div className="flex-column ms-1">
              <strong className={`${usernameColorClassName} fs-4 saira-condensed fw-bold`}>
                {userObj.username} {redemptionIndicator}
              </strong>
              <span className="text-info-emphasis d-block smaller fw-semibold">
                {relativeTime}
                {/* 9 mins ago */}
              </span>
            </div>
          </div>
          <div className="d-flex flex-row">
            <button className="btn btn-secondary btn-sm fw-semibold" onClick={btnProps.onClick}>
              {btnProps.label}
            </button>
            {btnSendCode}
          </div>

        </div>
      </div>
    );
  };

  renderStreamerSeatToggle = () => {
    return (
      <div className="toggle-streamer-seat card-header-item">
        <label className="toggle-label form-check-label" htmlFor="reserve-seat-for-streamer">
          Reserve seat for streamer?
        </label>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" role="switch" id="reserve-seat-for-streamer" defaultChecked={this.state.streamerSeat} onChange={this.toggleStreamerSeat} />
        </div>
      </div>
    );
  };

  renderPlayerCount = () => {
    let className = 'player-count';
    if (this.game?.['Max players'] < this.playerCount()) {
      className += ' overlimit';
    }
    return (
      <div className={className}>
        {this.playerCount()} of {this.game?.['Max players']} seats claimed
      </div>
    );
  };

  sendCode = (userObj) => {
    let player = {
      id: userObj['user-id'],
      username: userObj.username
    };
    return this.props.twitchApi.sendWhisper(player, this.state.roomCode);
  };

  sendCodeToAll = () => {
    if (!this.state.roomCode) {
      return;
    }
    if (this.state.playing.length === 0) {
      this.props.twitchApi.sendMessage('Sorry, can\'t send the code to 0 players. :p');
      return;
    }
    let sendingToMsg = 'Sending room code to';
    if (this.state.playing.length === 1) {
      this.props.twitchApi.sendMessage(`${sendingToMsg} 1 person`);
    } else {
      this.props.twitchApi.sendMessage(`${sendingToMsg} ${this.state.playing.length} people`);
    }

    return this.state.playing.forEach((userObj, i) => {
      (function(i, userObj, roomCode, props) {
        setTimeout(function() {
          let metadata = props.userLookup[userObj?.username] || {};
          return props.twitchApi.sendWhisper({
            id: metadata['user-id'],
            username: userObj.username
          }, roomCode);
        }, 1000 * (i+1));
      }(i, userObj, this.state.roomCode, this.props));
    });
  };

  render() {
    let startGameClass = 'btn btn-sm strt-game';
    if (this.playerCount() < this.game?.['Min players']) {
      startGameClass += ' disabled';
    }

    let inputRoomCode = (
      <div className="d-flex align-items-center p-3 my-3 text-white bg-purple rounded shadow-sm libre-franklin-font col-lg-8 col-xl-7 col-xxl-6">
        <div className="input-group">
          <input type="text" name="room-code" value={this.state.roomCode || ''}
            autoComplete="false"
            aria-autocomplete="none"
            aria-describedby="btn-send-to-queue"
            aria-label="Enter Room Code"
            className="form-control libre-franklin-font"
            onChange={this.handleRoomCodeChange}
            onFocus={this.handleRoomCodeFocus}
            placeholder="ENTER ROOM CODE"
            role="presentation"
            title="Paste Room Code Here"
          />
          <button type="button"
            className="btn btn-primary libre-franklin-font text-uppercase"
            id="btn-send-to-queue"
            onClick={this.sendCodeToAll}
            title="Send Code to All Players"
            disabled={this.state.playing.length===0 || !this.state.roomCode}
          >
            Send to Queue
          </button>
        </div>
      </div>
    );

    return (
      <div className="queues d-flex flex-column flex-md-row my-2 flex-wrap">
        <div className="queue my-1 px-md-1 col-12">
          {inputRoomCode}
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
              <span className="me-auto align-self-center">
                Interested
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
              <span className="me-auto align-self-center">
                Playing
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
