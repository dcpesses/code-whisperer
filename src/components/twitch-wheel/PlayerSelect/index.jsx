/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import * as fakeStates from '../example-states';

import dice from '../dice.svg';
import star from '../star.svg';

import './PlayerSelect.css';

// const dice = null;
// const star = null;

export default class PlayerSelect extends Component {
  constructor(props) {
    super(props);
    this.firstColumn = React.createRef();
    this.state = {
      interested: [],
      playing: [],
      joined: [],
      roomCode: null,
      sentCodeStatus: {},
      streamerSeat: false,
      isQueueOpen: true,
      randCount: 0
    };
    this.randInt = 0;
  }

  componentDidMount() {
    if (window.location.hash.indexOf('fakestate=true') !== -1) {
      this.setState(fakeStates.PlayerSelect);
    }
    // this.updateColumnSizes();
    // window.addEventListener('resize', this.updateColumnSizes);
    return;
  }

  componentWillUnmount() {
    // window.removeEventListener('resize', this.updateColumnSizes);
    clearInterval(this.randInt);
    return;
  }

  // updateColumnSizes = () => {
  //   this.setState((state) => {
  //     return {
  //       ...state,
  //       columnWidth: this.firstColumn.current.offsetWidth
  //     };
  //   });
  // };

  handleNewPlayerRequest = (username, {isPrioritySeat=false}) => {
    if (isPrioritySeat) {
      // even if the queue is closed, still add them to the interested column for consideration
      const column = (this.state.isQueueOpen ? 'playing' : 'interested');

      return this.updateColumnForUser({username, isPrioritySeat}, column)
        ? 'you have been successfully added to the lobby.'
        : 'there was an error adding you to the lobby.';
    }

    if (this.state?.interested?.map((uObj) => uObj.username)?.includes(username)
        || this.state?.playing?.map((uObj) => uObj.username)?.includes(username)
        || this.state?.joined?.map((uObj) => uObj.username)?.includes(username)) {
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
    return this.setState((state) => {
      return {
        ...state,
        interested: state.interested.filter((iObj) => iObj.username !== username),
        playing: state.playing.filter((pObj) => pObj.username !== username),
        joined:  state.joined.filter((jObj) => jObj.username !== username)
      };
    });
  };

  clearQueue = () => {
    return this.setState((state) => {
      return {
        ...state,
        interested: [],
        playing: [],
        joined: []
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
      + this.state.joined.length
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
    return this.props.game?.['Max players'] >= this.playerCount() &&
      this.props.game?.['Min players'] <= this.playerCount();
  };

  startGame = () => {
    // clear for now; eventually, save elsewhere to report on user play history for that session
    this.setState ((state) => {
      return {
        ...state,
        interested: [],
        playing: [],
        joined: [],
        roomCode: null
      };
    });
    this.props.startGame();
  };

  initRandomizePlayersAnimation = () => {
    const numPlayersToAdd = Math.min(
      this.props.game['Max players'] - this.playerCount(),
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
      this.props.game['Max players'] - this.playerCount(),
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
    this.setState((state) => {
      return {
        interested: state.interested.filter((uObj) => !randUsernameArray.includes(uObj.username)),
        playing
      };
    });
  };

  renderPlayerCard = (userObj, id, curColumn) => {
    if (this.props.userLookup && this.props.userLookup[userObj?.username]) {
      let metadata = this.props.userLookup[userObj.username];
      userObj = Object.assign({}, userObj, metadata);
    }

    let displaySendCodeBtn = (this.props.settings?.enableRoomCode && this.state.roomCode !== null);

    // let btnJoined;
    let btnPlaying;
    let btnInterested;
    let btnSendCode;

    // if (curColumn !== 'joined') {
    //     btnJoined = (
    //         <button className='change-col' onClick={this.updateColumnForUser.bind(this, userObj, 'joined')}>Joined</button>
    //     );
    // }
    if (curColumn !== 'playing') {
      btnPlaying = (
        <button className="change-col" onClick={this.updateColumnForUser.bind(this, userObj, 'playing')}>Playing</button>
      );
    }
    if (curColumn !== 'interested') {
      btnInterested = (
        <button className="change-col" onClick={this.updateColumnForUser.bind(this, userObj, 'interested')}>Interested</button>
      );
    }
    if (curColumn === 'playing' && displaySendCodeBtn) {
      btnSendCode = (
        <button className="change-col send-code" onClick={ this.sendCode.bind(this, userObj) }>Send Code</button>
      );
    }

    let redemptionIndicator;
    if (userObj.isPrioritySeat === true) {
      redemptionIndicator = (
        <img src={star} alt="Priority seat redemption"/>
      );
    }

    return (
      <div key={id} className="player-card lh-sm fs-5">
        <div className="player-card-username">
          {redemptionIndicator}
          <p className="player-name">{userObj.username}</p>
        </div>
        <div className="change-col-buttons-container">
          {btnSendCode}
          {btnInterested}
          {btnPlaying}
          {/*btnJoined*/}
          <button className="change-col" onClick={this.removeUser.bind(this, userObj.username)}>X</button>
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
    if (this.props.game?.['Max players'] < this.playerCount()) {
      className += ' overlimit';
    }
    return (
      <div className={className}>
        {this.playerCount()} of {this.props.game?.['Max players']} seats claimed
      </div>
    );
  };

  sendCode = (userObj) => {
    let player = {
      id: userObj['user-id'],
      username: userObj.username
    };
    return this.props.sendWhisper(player, this.state.roomCode);
  };

  sendCodeToAll = () => {
    if (!this.state.roomCode) {
      return;
    }
    if (this.state.playing.length === 0) {
      this.props.sendMessage('Sorry, can\'t send the code to 0 players. :p');
      return;
    }
    let sendingToMsg = 'Sending room code to';
    if (this.state.playing.length === 1) {
      this.props.sendMessage(`${sendingToMsg} 1 person`);
    } else {
      this.props.sendMessage(`${sendingToMsg} ${this.state.playing.length} people`);
    }

    return this.state.playing.forEach((userObj, i) => {
      (function(i, userObj, roomCode, props) {
        setTimeout(function() {
          let metadata = props.userLookup[userObj?.username] || {};
          return props.sendWhisper({
            id: metadata['user-id'],
            username: userObj.username
          }, roomCode);
        }, 1000 * (i+1));
      }(i, userObj, this.state.roomCode, this.props));
    });
  };

  render() {
    let startGameClass = 'btn btn-sm start-game';
    if (this.playerCount() < this.props.game?.['Min players']) {
      startGameClass += ' disabled';
    }

    let inputRoomCode;
    if (this.state.playing.length > 0 && this.props.settings?.enableRoomCode) {
      inputRoomCode = (
        <div className="input-group input-group-sm">
          <input type="password" name="room-code" value={this.state.roomCode || ''} size="5"
            autoComplete="new-password"
            aria-autocomplete="none"
            aria-describedby="room-code-label"
            className="form-control room-code py-0"
            onChange={this.handleRoomCodeChange}
            onFocus={this.handleRoomCodeFocus}
            placeholder="Code"
            title="Paste Room Code Here" />
          <button className="btn btn-sm btn-outline-secondary" onClick={this.sendCodeToAll} title="Send Code to All Players">&#10132;</button>
        </div>
      );
    }

    return (
      <div className={`card player-select-container rand-${this.state.randCount}`}>
        <div className="card-header d-flex justify-content-between">
          {this.renderStreamerSeatToggle()}
          <div className="fs-2 lh-sm game-name">
            <b>{this.props.game?.name ?? 'TBD'}</b>
            {this.renderPlayerCount()}
          </div>

          <div className="card-header-item d-flex align-items-center align-self-center flex-column">
            {inputRoomCode}
            <button className={startGameClass} onClick={this.startGame} disabled={!this.canStartGame()}>
              Start Game
            </button>
          </div>
        </div>
        <div className="card-body player-card-container">
          <div ref={this.firstColumn} className="player-card-column interested">
            <p className="player-card-column-header">Interested</p>
            {this.state.interested.filter((iObj) => iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'interested') )}
            {this.state.interested.filter((iObj) => !iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'interested') )}
          </div>

          <div className="player-card-column playing">
            <p className="player-card-column-header">Playing
              <button className="dice" onClick={this.initRandomizePlayersAnimation}>
                <img src={dice} alt="dice icon"/>
              </button>
            </p>
            {this.state.playing.filter((iObj) => iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'playing') )}
            {this.state.playing.filter((iObj) => !iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'playing') )}
          </div>

          {/*<div className='player-card-column joined'>
                        <p className="player-card-column-header">Joined</p>
                        {this.state.joined.filter((iObj) => iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'joined') )}
                        {this.state.joined.filter((iObj) => !iObj.isPrioritySeat).map((userObj, i) => this.renderPlayerCard(userObj, i, 'joined') )}
                    </div>*/}
        </div>
      </div>
    );
  }
}
