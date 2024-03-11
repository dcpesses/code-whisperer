/* eslint-disable react/prop-types */
import {Component} from 'react';
import {Button, Collapse, Dropdown, Offcanvas} from 'react-bootstrap';
// import OptionsGameList from './OptionsGameList';
import PropTypes from 'prop-types';
import {version} from '../../package.json';

import './OptionsMenu.css';

export default class OptionsMenu extends Component {
  static get propTypes() {
    return {
      debugItems: PropTypes.array,
      // gamesList: PropTypes.object,
      items: PropTypes.array,
      onHide: PropTypes.func,
      onLogout: PropTypes.func,
      showOptionsMenu: PropTypes.bool,
      // showSettingsMenu: PropTypes.bool
    };
  }
  static get defaultProps() {
    return {
      debugItems: [],
      gamesList: {
        allowedGames: null,
        validGames: null
      },
      items: [],
      onHide: () => void 0,
      onLogout: () => void 0,
      showOptionsMenu: false,
      showSettingsMenu: false
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      showGameList: false
    };
    this.toggleGameList = this.toggleGameList.bind(this);
    this.toggleSettingsMenu = this.toggleSettingsMenu.bind(this);
  }

  /*

    Expects the following object schema:
    {
        label: string,  // required
        onClick: func,
        listItemClassName: string,
        btnClassName: string
    }


     */
  createDebugMenuItems = (items) => {
    if (!items) {
      return [];
    }
    return items.map((i, idx) => {
      if (!i || !i.label) {
        return null;
      }
      if (/^[-]+$/i.test(i.label)) {
        return (
          <Dropdown.Divider key={i.idx} eventKey={i.idx} />
        );
      }
      return (
        <Dropdown.Item
          eventKey={i.label}
          href={i.href || null}
          key={`${idx} ${i.label}`}
          onClick={i.onClick || null}
        >
          {i.label}
        </Dropdown.Item>
      );
    }).filter(i => i);
  };

  createMenuItems = (items) => {
    if (!items) {
      return [];
    }
    return items.map(i => {
      if (!i.label) {
        return null;
      }
      let liClassName = (!i.listItemClassName)
        ? i.label.trim().toLowerCase().split(' ').join('-')
        : i.listItemClassName;
      let listItemClassNames = ['mb-1 fs-4 d-grid text-start', liClassName || null].filter(n => n).join(' ');
      let btnClassNames = ['btn', i.btnClassName || null].filter(n => n).join(' ');
      return (
        <li className={listItemClassNames} key={i.label}>
          <Button variant="link" className={btnClassNames} onClick={i.onClick || null}>
            {i.label}
          </Button>
        </li>
      );
    }).filter(i => i);
  };

  toggleGameList = () => {
    this.setState((state) => {
      return {
        showGameList: !state.showGameList
      };
    });
  };

  toggleSettingsMenu = () => {
    this.setState((state) => {
      return {
        showSettingsMenu: !state.showSettingsMenu
      };
    });
  };
  // renderGameOptions() {
  //     let {allowedGames, validGames} = this.props.gamesList;
  //     let gamePackList = [].concat(...Object.entries(validGames).map((packData, idx) => {
  //         return Object.keys(packData[1]).map(gameData => {
  //             let gameId = `${packData[0]} ${gameData}`.replace(/\W/ig, '_');
  //             return {
  //                 id: gameId,
  //                 game: gameData,
  //                 pack: packData[0]
  //             }
  //         })
  //     }))
  //
  //
  //
  //     // let gamesList = gamePackList.map(g => g.game);
  //     console.log('gamePackList:', gamePackList, allowedGames);
  //
  //     return (
  //         <Modal
  //             show={this.state.showOptionsModal}
  //             onHide={()=>this.toggleOptionsModal(false)}
  //             size="lg"
  //             aria-labelledby="contained-modal-title-vcenter"
  //             centered>
  //             <Modal.Header closeButton>
  //                 <Modal.Title id="contained-modal-title-vcenter">
  //                     Options
  //                 </Modal.Title>
  //             </Modal.Header>
  //             <Modal.Body>
  //                 <div className="options-list">
  //                     <ul>
  //                         {gamePackList.map(({id, game, pack}, idx) => {
  //                             // let gameId = `${g.pack} ${g.game}`.replace(/\W/ig, '_');
  //                             return (
  //                                 <li key={id}>
  //                                     <input type="checkbox" id={id} name={id} value={id} /> <label htmlFor={id}>{pack}: {game}</label>
  //                                 </li>
  //                             )}
  //                         )}
  //                     </ul>
  //                 </div>
  //             </Modal.Body>
  //             <Modal.Footer>
  //                 <Button data-bs-dismiss="modal">Close</Button>
  //             </Modal.Footer>
  //         </Modal>
  //     );
  // }

  render() {
    let {debugItems, items, settings, onSettingsUpdate} = this.props;
    let optionMenuItems = this.createMenuItems(items);
    let debugMenuItems = this.createDebugMenuItems(debugItems);

    let toggleSubRequests = () => {
      let value = typeof settings?.enableSubRequests === 'boolean'
        ? !settings?.enableSubRequests
        : true;
      onSettingsUpdate({enableSubRequests: value});
    };
    let toggleSubRequestLimit = () => {
      let value = typeof settings?.enableSubRequestLimit === 'boolean'
        ? !settings?.enableSubRequestLimit
        : true;
      onSettingsUpdate({enableSubRequestLimit: value});
    };
    let toggleClearSeatsAfterRedeem = () => {
      let value = typeof settings?.clearSeatsAfterRedeem === 'boolean'
        ? !settings?.clearSeatsAfterRedeem
        : true;
      onSettingsUpdate({clearSeatsAfterRedeem: value});
    };
    let updateCustomDelimiter = (e) => {
      let {value} = e.target;
      if (!value) {
        value = null;
      } else {
        value = value.trim();
      }
      onSettingsUpdate({customDelimiter: value});
    };
    let toggleEnableRoomCode = () => {
      let value = typeof settings?.enableRoomCode === 'boolean'
        ? !settings?.enableRoomCode
        : true;
      onSettingsUpdate({enableRoomCode: value});
    };

    return (
      <Offcanvas
        id="options-menu"
        onHide={this.props.onHide}
        placement="end"
        show={this.props.showOptionsMenu}>
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title as="h2" className="fw-bold">
            Options
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="options-menu-items list-unstyled pb-3 px-4">
            <li className="mb-1 fs-4 d-grid text-start">
              <Button variant="link" className="btn logout" onClick={this.props.onLogout}>
                Logout
              </Button>
            </li>
            <hr />
            <li className="mb-1 fs-4 d-grid text-start">
              <Button variant="link" className="btn settings-menu" onClick={this.toggleSettingsMenu}>
                Settings
              </Button>
            </li>
            <Collapse in={this.state.showSettingsMenu}>
              <div id="settings-menu" className="accordion-dark accordion accordion-flush">
                <div className="accordion-body">
                  <Button variant="link" className="btn settings-menu"
                    onClick={toggleSubRequests}
                    title="Allows subscribers to make additional game requests when enabled."
                  >
                    <input type="checkbox" role="switch" checked={(settings?.enableSubRequests)} readOnly /> <span>Enable Sub Requests</span>
                  </Button>
                  <Button variant="link" className="btn settings-menu subsetting"
                    onClick={toggleSubRequestLimit}
                    title="Limit subscribers to one additional game requests when enabled."
                    disabled={!(settings?.enableSubRequests)}
                  >
                    <input type="checkbox" role="switch" checked={(settings?.enableSubRequestLimit)} readOnly /> <span>Limit 1 Sub Request</span>
                  </Button>
                  <Button variant="link" className="btn settings-menu"
                    onClick={toggleClearSeatsAfterRedeem}
                    title="Clears the list of player signups after a game redemption."
                  >
                    <input type="checkbox" role="switch" checked={(settings?.clearSeatsAfterRedeem)} readOnly /> <span>Clear Seats After Redeem</span>
                  </Button>

                  <Button variant="link" className="btn settings-menu"
                    title="Uses a custom character or emote to separate requests listed in the chat."
                  >
                    <span>Use Custom Delimiter: </span>
                    <input type="text" name="custom-delimiter" defaultValue={settings?.customDelimiter}
                      onChange={updateCustomDelimiter} className="form-control" />
                  </Button>

                  <Button variant="link" className="btn settings-menu"
                    onClick={toggleEnableRoomCode}
                    title="Allows host to set a room code that can be whispered to players."
                  >
                    <input type="checkbox" role="switch" checked={(settings?.enableRoomCode)} readOnly /> <span>Enable Room Code <small>(beta)</small></span>
                  </Button>
                </div>
              </div>
            </Collapse>
            {optionMenuItems}
            <li className="mb-1 fs-4 d-grid text-start d-none">
              <Button variant="link" className="btn reload-game-list" onClick={this.props.reloadGameList}>
                Refresh Game List
              </Button>
            </li>
            <li className="mb-1 fs-4 d-grid text-start d-none">
              <Button variant="link" className="btn game-list" onClick={this.toggleGameList}>
                Game List
              </Button>
            </li>
            {/* <Collapse in={this.state.showGameList}>
              <div>
                <OptionsGameList
                  allowedGames={this.props.gamesList?.allowedGames}
                  validGames={this.props.gamesList?.validGames} />
              </div>
            </Collapse> */}
          </ul>

          <div id="options-debug-menu-items" className="position-absolute bottom-0 start-0 end-0 pb-3 text-center">
            <Dropdown id="dropdown-debug-menu-items" drop="up-centered" variant="link">
              <Dropdown.Toggle id="dropdown-debug-menu-items-toggle" size="sm" variant="link">
                {`version ${version}`}
              </Dropdown.Toggle>
              <Dropdown.Menu variant="dark">
                <Dropdown.Header>
                  Debug Options
                </Dropdown.Header>
                {debugMenuItems}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
}
