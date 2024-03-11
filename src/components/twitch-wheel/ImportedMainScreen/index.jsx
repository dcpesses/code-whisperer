/* eslint-disable no-console */
/* eslint-disable react/prop-types */
/* eslint--disable */

import {Component} from 'react';
import {Button, Modal} from 'react-bootstrap';
import ChatActivity, { ActivityStatus } from '../ChatActivity';
// import ConfettiExplosion from 'react-confetti-explosion';
// import GameRequest from '../GameRequest';
import MessageHandler from '../MessageHandler';
import OptionsMenu from '../OptionsMenu';
import PlayerSelect from '../PlayerSelect';
// import Sidebar from '../Sidebar';
// import WheelComponent from '../WheelComponent'; //'react-wheel-of-prizes'
import * as fakeStates from '../example-states';

import './MainScreen.css';
// import 'bootstrap/dist/css/bootstrap.css';
// const randomColor = require('randomcolor');


export default class ImportedMainScreen extends Component {
  constructor(props) {
    super(props);
    this.chatActivity = new ChatActivity(this.props.channel);
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
      gameSelected: null,
      messages: {},
      colors: ['#b0a4f9', '#bff0ff', '#7290f9', '#81cef4', '#a3faff', '#96eaff', '#8cf1ff', '#7fc0e8', '#70b3ea', '#92c3fc', '#b2dcf4', '#7b92ed', '#a7d0f2', '#c4f5fc', '#aaefff', '#aabdef', '#9bc0ef', '#99edff', '#70b0f9', '#c4e1ff', '#9a86e8', '#beb9f7',],
      counter: 0,
      history: [], // requested / played games
      logUserMessages: false,
      nextGameIdx: 0,
      settings,
      showOptionsMenu: false,
      showOptionsModal: false,
      showPlayerSelect: true,
      userLookup: {}
    };

    this.playerSelector = null;
    this.messageHandler = null;

    this.changeNextGameIdx = this.changeNextGameIdx.bind(this);
    this.moveNextGameFwd = this.moveNextGameFwd.bind(this);
    this.moveNextGameBack = this.moveNextGameBack.bind(this);
    this.addGameRequest = this.addGameRequest.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.setNextGame = this.setNextGame.bind(this);
    this.addGameToQueue = this.addGameToQueue.bind(this);
    this.onWheelSpun = this.onWheelSpun.bind(this);
    this.removeGame = this.removeGame.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.toggleAllowGameRequests = this.toggleAllowGameRequests.bind(this);
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
  }

  componentDidMount() {
    if (window.location.hash.indexOf('fakestate=true') !== -1) {
      this.setState(
        Object.assign({}, fakeStates.ImportedMainScreen, {
          showPlayerSelect: true
        })
      );
    }
  }

  changeNextGameIdx = (delta = 1) => {
    if (this.state.nextGameIdx + delta > this.state.history.length) {return false;}
    if (this.state.nextGameIdx + delta < 0) {return false;}
    this.setState((state) => {
      return {
        nextGameIdx: state.nextGameIdx + delta
      };
    });
    return true;
  };

  changeGameOrder = (history, nextGameIdx) => {
    if (nextGameIdx > history.length) {return false;}
    this.setState({
      history,
      nextGameIdx
    });
    return true;
  };

  moveNextGameFwd = () => {
    return this.changeNextGameIdx();
  };

  moveNextGameBack = () => {
    return this.changeNextGameIdx(-1);
  };

  addGameRequest = (gameObj, user, isSubRequest) => {
    this.setState((state) => {
      return {
        ...state,
        messages: {
          ...this.state.messages,
          [gameObj.longName]: {
            ...gameObj,
            username: user,
            isSubRequest,
            time: Date.now(),
            locked: false,
            chosen: false
          }
        },
        counter: this.state.counter + 1
      };
    });
  };

  toggleLock = (game) => {
    const stateCopy = {...this.state.messages[game]};
    stateCopy.locked = !stateCopy.locked;

    this.setState(() => {
      return {
        ...this.state,
        messages: {
          ...this.state.messages,
          [game]: stateCopy
        }
      };
    });
  };

  // @return: the number of games ahead of this one, after successfully inserting in queue
  // (i.e. if it's the very next game, return 0; if there's one ahead, return 1; etc)
  setNextGame = (gameObj) => {
    let idx = this.state.nextGameIdx;

    // insert next game at next up position by default, but
    //      *after* any other manually inserted games
    while (idx < this.state.history.length && this.state.history[idx]?.override) {
      idx++;
    }

    this.setState((state) => {
      return {
        ...state,
        history: [
          ...state.history.slice(0, Math.max(0, idx)),
          {
            ...gameObj,
            override: true,
            time: Date.now()
          },
          ...state.history.slice(idx)
        ]
      };
    });

    return idx - this.state.nextGameIdx;
  };

  addGameToQueue = (gameObj) => {
    // update history + game card highlight color
    this.setState((state) => {
      return {
        ...state,
        gameSelected: gameObj,
        history: [
          ...this.state.history,
          {
            ...gameObj,
            override: false
          }
        ],
        messages: {
          ...state.messages,
          [gameObj.longName]: {
            ...state.messages[gameObj.longName],
            chosen: true
          }
        }
      };
    });
  };

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
        console.log('REACT_APP_REDIRECT_URI:', import.meta.env.VITE_APP_REDIRECT_URI);
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
    //   label: 'Reload Game List',
    //   onClick: this.messageHandler?.reloadGameList
    // }, {
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
    }];
  };

  onWheelSpun = (gameLongName) => {
    const gameRequestObj = this.state.messages?.[gameLongName];
    if (!gameRequestObj) {return;}

    // send confirmation message in chat
    const requester = gameRequestObj.username;

    this.addGameToQueue(gameRequestObj);

    // remove card unless it's locked
    if (!this.state.messages[gameLongName].locked) {
      setTimeout(() => {
        this.removeGame(gameLongName);
        this.clearModal();
      }, 4000);
    }

    return this.chatActivity.getStatusPromise(requester).then((status) => {
      let msg = '';
      switch (status) {
      case ActivityStatus.DISCONNECTED:
        msg = `/me ${gameRequestObj.name} just won the spin, but it doesn't seem like @${requester} is still around. Hope someone else wants to play!`;
        break;

      case ActivityStatus.ACTIVE:
        msg = `/me @${requester}, good news - ${gameRequestObj.name} just won the spin!`;
        break;

      case ActivityStatus.IDLE:
      default:
        msg = `/me @${requester}, good news - ${gameRequestObj.name} just won the spin! (I hope you're still around!)`;
      }
      return this.messageHandler.sendMessage(msg);
    });

  };

  removeGame = (gameLongName) => {
    const newMessageObj = {...this.state.messages};
    delete newMessageObj[gameLongName];
    this.setState((state) => {
      return {
        ...state,
        messages: newMessageObj,
        counter: this.state.counter + 1
      };
    });
  };

  removeSelectedGameFromHistory = () => {
    let {history, nextGameIdx} = this.state;
    if (!history[nextGameIdx]) {
      return false;
    }
    let currGame = history[nextGameIdx];
    delete history[nextGameIdx];
    this.setState({
      history: history.filter(h => !!h),
      nextGameIdx: Math.max(-1, Math.min(nextGameIdx, history.length))
    });
    return currGame;
  };

  onMessage = (message, user, metadata) => {
    this.chatActivity.updateLastMessageTime(user);
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
    return this.setState(prevState => ({
      settings: Object.assign({}, settings, nextSettings)
    }));
  };

  toggleAllowGameRequests = (allow=null) => {
    let {allowGameRequests} = this.state;
    if (allow !== null && typeof allow !== 'object') {
      allowGameRequests = !allow;
    }
    this.setState((state) => {
      return {
        allowGameRequests: !allowGameRequests
      };
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
      this.messageHandler?.sendMessage(`/me @${user}, ${msg}`);
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
    // this feels so janky...but it works
    return this.messageHandler?.sendMessage(msg);
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
    let requestParams = new URLSearchParams({
      from_user_id: this.props.id,
      to_user_id: player.id
    });
    let requestBody = {message: msg};
    await this.props.validateToken();
    return fetch(`https://api.twitch.tv/helix/whispers?${requestParams}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        // Accept: 'application/vnd.twitchtv.v5+json',
        Authorization: `Bearer ${this.props.access_token}`,
        'Client-ID': import.meta.env.VITE_APP_TWITCH_CLIENT_ID,
        'Content-Type': 'application/json'
      }
    })
      .then(async response => {
        if (response.status !== 204) {
          let errMsg = `Error ${response.status} sending to @${player.username}`;
          // console.log(errMsg);
          let errJson;
          try {
            errJson = await response.json();
            if (errJson.error) {
              errMsg += `: ${errJson.error}`;
            }
            errJson.player = player;
            console.log({errMsg, error: errJson});
          } catch (e) {
            console.log({errMsg, error: e});
          }
          this.messageHandler?.sendMessage(`/me ${errMsg}`);
          return Promise.resolve(errMsg);
        }
        let msg = `Code sent to @${player.username}`;
        this.messageHandler?.sendMessage(`/me ${msg}`);
        return Promise.resolve(msg);
      }).catch(error => {
        let errMsg = `Error sending to @${player.username}, please check console for details.`;
        console.log({errMsg, error});
        this.messageHandler?.sendMessage(`/me ${errMsg}`);
        return Promise.reject(errMsg);
      });
  };

  startGame = () => {
    if (this.state.showPlayerSelect) {
      this.togglePlayerSelect();
      this.moveNextGameFwd();
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

  renderGameChosenModal(gameObj) {
    // let confettiProps = {
    //   force: 0.6,
    //   duration: 3500,
    //   particleCount: 100,
    //   floorHeight: Math.max(window.outerWidth, window.outerHeight),
    //   floorWidth: Math.max(window.outerWidth, window.outerHeight)
    // };
    let requestedBy;
    if (gameObj.username) {
      requestedBy = (<h4>requested by @{gameObj.username}</h4>);
    }
    return (
      <>
        <div className="overlay fade-in-out">
          {/* <div className="confetti-wrapper">
            <ConfettiExplosion {...confettiProps} />
          </div> */}
        </div>
        <div className="confetti-modal modal-game-chosen fade-in-out" onClick={()=>this.removeGame(gameObj.longName)}>
          <h1>{gameObj.name}</h1>
          {requestedBy}
        </div>
      </>
    );
  }

  renderOptionsModal() {
    let {allowedGames, validGames} = this.messageHandler.state;
    let gamePackList = [].concat(...Object.entries(validGames).map((packData, idx) => {
      return Object.keys(packData[1]).map(gameData => {
        let gameId = `${packData[0]} ${gameData}`.replace(/\W/ig, '_');
        return {
          id: gameId,
          game: gameData,
          pack: packData[0]
        };
      });
    }));
    // let gamesList = gamePackList.map(g => g.game);
    console.log('gamePackList:', gamePackList, allowedGames);

    return (
      <Modal
        show={this.state.showOptionsModal}
        onHide={()=>this.toggleOptionsModal(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Options
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Options</h4>
          <div className="options-list">
            <ul>
              {gamePackList.map(({id, game, pack}, idx) => {
                // let gameId = `${g.pack} ${g.game}`.replace(/\W/ig, '_');
                return (
                  <li key={id}>
                    <input type="checkbox" id={id} name={id} value={id} /> <label htmlFor={id}>{pack}: {game}</label>
                  </li>
                );
              }
              )}
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button data-bs-dismiss="modal">Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    const gameRequestArray = Object.keys(this.state.messages);


    let gameSelectedModal;
    if (this.state.showOptionsModal) {
      gameSelectedModal = this.renderOptionsModal();
    } else if (this.state.gameSelected) {
      gameSelectedModal = this.renderGameChosenModal(this.state.gameSelected);
    }

    let mainClassName = this.state.showPlayerSelect ? 'player-select' : 'game-select';

    let subheading = this.state.showPlayerSelect ? (
      <span className="subheading-player fade-in-delay">
        Type <b>!new</b> in {this.props.channel}&apos;s chat if you want to join the next game
      </span>
    ) : (
      <span
        className={`subheading-game ${(this.state.allowGameRequests === true ? 'fade-in-delay' : 'fade-out')}`}
        title={`Click to ${this.state.allowGameRequests === true ? 'disable' : 'enable'} game requests.`}
        onClick={this.toggleAllowGameRequests}>
        Type e.g. <b>&quot;!request Blather Round&quot;</b> in {this.props.channel}&apos;s chat to add
      </span>
    );

    let innerContent;
    let rightColumn;

    if (this.state.showPlayerSelect) {
      innerContent = (
        <PlayerSelect
          game={this.state.history?.[this.state.nextGameIdx]}
          sendMessage={this.sendMessage}
          sendWhisper={this.sendWhisper}
          settings={this.state.settings}
          startGame={this.startGame}
          ref={this.setPlayerSelectRef}
          userLookup={this.state.userLookup}
        />
      );
    } else {
      innerContent = gameRequestArray.map((gameName, i) => (
        <div key={i}>
          <div>gameName: {gameName}</div>
          <div>metadata: {JSON.stringify(this.state.messages[gameName])}</div>
        </div>
      ));
      rightColumn = (
        <div className="right-column" width="50px">
          <div className="wheel-wrapper fade-in">
            Wheel
          </div>
        </div>
      );
      /*innerContent = gameRequestArray.map((gameName, i) =>
        <GameRequest
          key={i}
          gameName={gameName}
          metadata={this.state.messages[gameName]}
          onDelete={this.removeGame}
          toggleLock={this.toggleLock.bind(gameName)}
          getActivity={this.chatActivity.getStatusPromise}
        />
      );
      // reduce spin time for large number of game requests
      let upDuration = (gameRequestArray.length < 5) ? 100 : (500 / gameRequestArray.length);
      let downDuration = (gameRequestArray.length < 5) ? 1000 : (5000 / gameRequestArray.length);

      rightColumn = (
        <div className="right-column" width="50px">
          <div className="wheel-wrapper fade-in">
            <WheelComponent
              key={this.state.counter}
              segments={gameRequestArray}
              segColors={this.state.colors}
              onFinished={this.onWheelSpun}
              isOnlyOnce={false}
              size={250}
              upDuration={upDuration}
              downDuration={downDuration}
              primaryColor={'white'}
              contrastColor={'black'}
              fontFamily={'Arial'}
              multilineDelimiter={' ('}
            />
          </div>
        </div>
      );*/
    }

    let gamesList = this.getGamesList();

    return (
      <div className="main-screen-wrapper">
        <nav className="main-screen-nav navbar-dark">
          <button className="btn btn-toggle-options float-end navbar-toggler" type="button" onClick={this.toggleOptionsMenu}>
            <span className="navbar-toggler-icon"></span>
          </button>
        </nav>
        <div id="main-screen" className={mainClassName}>
          <MessageHandler
            access_token={this.props.access_token}
            addGameRequest={this.addGameRequest}
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
            openQueueHandler={this.routeOpenQueueRequest}
            playerExitHandler={this.routeLeaveRequest}
            previousGames={this.state.history.slice(0, this.state.nextGameIdx)}
            ref={this.setMessageHandlerRef}
            removeSelectedGameFromHistory={this.removeSelectedGameFromHistory}
            setNextGame={this.setNextGame}
            settings={this.state.settings}
            onSettingsUpdate={this.onSettingsUpdate}
            startGame={this.startGame}
            toggleAllowGameRequests={this.toggleAllowGameRequests}
            upcomingGames={this.state.history.slice(this.state.nextGameIdx)}
          />
          <div className="left-column fade-in">

            <h1>{this.state.showPlayerSelect ? 'Seat Requests' : 'Game Requests'}</h1>
            <h4>{subheading}</h4>

            <div className="left-column-body">
              {/* <Sidebar
                changeGameOrder={this.changeGameOrder}
                parentState={this.state}
                history={this.state.history}
                nextGameIdx={this.state.nextGameIdx}
                changeNextGameIdx={this.changeNextGameIdx}
                moveNextGameFwd={this.moveNextGameFwd}
                moveNextGameBack={this.moveNextGameBack}
                togglePlayerSelect={this.togglePlayerSelect}
                requestMode={this.state.showPlayerSelect ? 'seat' : 'game'}
                removeSelectedGameFromHistory={this.removeSelectedGameFromHistory}
              /> */}
              <div className="left-column-inner-body">
                {innerContent}
              </div>
            </div>
          </div>
          {rightColumn}
          {gameSelectedModal}
          <OptionsMenu
            gamesList={gamesList}
            parentState={this.state}
            debugItems={this.getOptionsDebugMenu()}
            items={this.getOptionsMenu()}
            reloadGameList={this.messageHandler?.reloadGameList}
            onHide={this.toggleOptionsMenu}
            onLogout={this.props.onLogout}
            onSettingsUpdate={this.onSettingsUpdate}
            settings={this.state.settings}
            showOptionsMenu={this.state.showOptionsMenu}
            toggleDebugView={this.props.toggleDebugView} />
        </div>
      </div>
    );
  }
}
