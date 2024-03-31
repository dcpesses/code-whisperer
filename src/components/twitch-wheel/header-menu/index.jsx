
import {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Collapse, Dropdown} from 'react-bootstrap';
// import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { setChannelInfo } from '@/features/twitch/channel-slice';
import { showModalCommandList } from '@/features/modal-command-list/modalSlice';
// import OptionsGameList from './OptionsGameList';
import PropTypes from 'prop-types';
import {version} from '../../../../package.json';

import './header-menu.css';

export class HeaderMenu extends Component {
  static get propTypes() {
    return {
      channelInfo:PropTypes.object,
      debugItems: PropTypes.array,
      // gamesList: PropTypes.object,
      moderatedChannelsItems: PropTypes.array,
      moderatedChannels: PropTypes.array,
      onLogout: PropTypes.func,
      onSettingsUpdate: PropTypes.func,
      settings: PropTypes.object,
      setChannelInfo: PropTypes.func,
      showModalCommandList: PropTypes.func,
      toggleChangelogModal: PropTypes.func,
      twitchApi: PropTypes.object,
      userInfo: PropTypes.object,
    };
  }
  static get defaultProps() {
    return {
      channelInfo: {},
      debugItems: [],
      gamesList: {
        allowedGames: null,
        validGames: null
      },
      moderatedChannelsItems: [],
      moderatedChannels: [],
      onLogout: () => void 0,
      onSettingsUpdate: () => void 0,
      settings: {},
      setChannelInfo: () => void 0,
      showModalCommandList: () => void 0,
      toggleChangelogModal: () => void 0,
      twitchApi: null,
      userInfo: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      showGameList: false,
      showSettingsMenu: false,
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
  createDebugMenuItems = (items, activeLabel=null) => {
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
          active={activeLabel && activeLabel === i.label}
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

  createModeratedChannelsMenuItems = (activeLabel) => {
    if (!this.props.moderatedChannels) {
      return null;
    }
    const currentUser = {
      broadcaster_id: this.props.userInfo?.id,
      broadcaster_login: this.props.userInfo?.login,
      broadcaster_name: this.props.userInfo?.display_name,
    };

    const items = [currentUser].concat(this.props.moderatedChannels).map(
      channel => ({
        label: channel.broadcaster_name,
        onClick: this.onModeratedChannelMenuItem.bind(this, channel)
      })
    );
    return (
      <>
        <Dropdown.Header>
          Moderated Channels
        </Dropdown.Header>
        {this.createDebugMenuItems(items.slice(0, 1), activeLabel)}
        <Dropdown.Divider />
        {this.createDebugMenuItems(items.slice(1), activeLabel)}
      </>
    );
  };

  onModeratedChannelMenuItem = async(channel) => {
    try {
      let channelInfo = await this.props.twitchApi.switchChannel(channel.broadcaster_login);
      // window.console.log('onModeratedChannelMenuItem', {channelInfo});
      if (!channelInfo) {
        channelInfo = this.props.twitchApi.channelInfo;
      }
      this.props.setChannelInfo(channelInfo.data[0]);
      return;
    } catch (e) {
      console.error(`getModeratedChannelsMenu - ${channel.broadcaster_name} - error`, e);
    }
  };


  createMenuItems = (items) => {
    if (!items) {
      return [];
    }
    return items.map(i => {
      if (!i.label) {
        return null;
      }
      /*let liClassName = (!i.listItemClassName)
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
      );*/
      return (
        <Nav.Link key={i.label} onClick={i.onClick || null}>
          {i.label}
        </Nav.Link>
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

  render() {
    let {debugItems, moderatedChannelsItems, settings, onSettingsUpdate} = this.props;
    let debugMenuItems = this.createDebugMenuItems(debugItems);

    /*
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
    */
    let updateCustomDelimiter = (e) => {
      let {value} = e.target;
      if (!value) {
        value = null;
      } else {
        value = value.trim();
      }
      onSettingsUpdate({customDelimiter: value});
    };
    let updateCustomJoinCommand = (e) => {
      let {value} = e.target;
      if (!value) {
        value = null;
      } else {
        value = value.trim();
      }
      onSettingsUpdate({customJoinCommand: value});
    };
    let updateCustomLeaveCommand = (e) => {
      let {value} = e.target;
      if (!value) {
        value = null;
      } else {
        value = value.trim();
      }
      onSettingsUpdate({customLeaveCommand: value});
    };
    let toggleEnableRoomCode = () => {
      let value = typeof settings?.enableRoomCode === 'boolean'
        ? !settings?.enableRoomCode
        : true;
      onSettingsUpdate({enableRoomCode: value});
    };
    let toggleJoinConfirmationMessage = () => {
      let value = typeof settings?.enableJoinConfirmationMessage === 'boolean'
        ? !settings?.enableJoinConfirmationMessage
        : true;
      onSettingsUpdate({enableJoinConfirmationMessage: value});
    };
    let toggleLeaveConfirmationMessage = () => {
      let value = typeof settings?.enableLeaveConfirmationMessage === 'boolean'
        ? !settings?.enableLeaveConfirmationMessage
        : true;
      onSettingsUpdate({enableLeaveConfirmationMessage: value});
    };

    // user may not always be same as broadcaster/channel
    let selectedUserInfo = this.props.channelInfo;
    let displayName = this.props.channelInfo.display_name;
    let isUserChannel = (this.props.channelInfo.login === this.props.userInfo.login);

    let img;
    if (selectedUserInfo.profile_image_url) {
      img = (
        <>
          {!isUserChannel && (
            <img
              src={this.props.userInfo.profile_image_url}
              className="rounded-circle navbar-pfp-img proxy-profile-img"
              alt={this.props.userInfo.display_name}
            />
          )}
          <img
            src={selectedUserInfo.profile_image_url}
            className="rounded-circle navbar-pfp-img"
            alt={selectedUserInfo.display_name}
          />
        </>
      );
    }

    let moderatedChannelsMenuItems = this.createModeratedChannelsMenuItems(moderatedChannelsItems, selectedUserInfo.login);

    return (
      <Navbar expand={false} data-bs-theme="dark" className="bg-body-tertiary mb-3 py-0 raleway-font">
        <Container fluid>

          <Dropdown id="dropdown-moderated-channels" variant="link">
            <Dropdown.Toggle id="dropdown-moderated-channels-toggle" size="sm" variant="link" className="text-decoration-none text-white px-0">
              <Navbar.Brand className="fw-semibold">{img} {displayName}</Navbar.Brand>
            </Dropdown.Toggle>
            <Dropdown.Menu variant="dark">
              {moderatedChannelsMenuItems}
            </Dropdown.Menu>
          </Dropdown>

          <Navbar.Toggle aria-controls="navbar-options-menu" className="border-0 rounded-0" />
          <Navbar.Offcanvas
            id="navbar-options-menu"
            aria-labelledby="navbar-options-menu-label"
            placement="end"
            className="raleway-font"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="navbar-options-menu-label" className="fw-bold fs-4">
                Options
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="fw-medium">
              <Nav className="justify-content-end flex-grow-1 pe-3 fs-5">
                <Nav.Link onClick={this.props.onLogout}>Logout</Nav.Link>
                <hr className="border-bottom my-2" />
                <Nav.Link className="settings-menu" onClick={this.toggleSettingsMenu}>
                  Settings
                </Nav.Link>
                <Collapse in={this.state.showSettingsMenu}>
                  <div id="settings-menu" className="accordion-dark accordion accordion-flush">
                    <div className="accordion-body">
                      <Button variant="link" id="enable-room-code" className="btn settings-menu"
                        onClick={toggleEnableRoomCode}
                        title="Allows host to set a room code that can be whispered to players."
                      >
                        <input type="checkbox" role="switch" checked={(settings?.enableRoomCode)} readOnly /> <span>Enable Room Code</span>
                      </Button>

                      {/*
                      <Button variant="link" className="btn settings-menu link-body-emphasis"
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
                       */}
                      <Button variant="link" className="btn settings-menu"
                        title="Replaces the !join command with a custom term to use to join the Interested queue."
                      >
                        <span htmlFor="custom-join-command">Use Custom Join Command: </span>
                        <input type="text" id="custom-join-command" name="custom-join-command"
                          placeholder="e.g. !join"
                          defaultValue={settings?.customJoinCommand}
                          onChange={updateCustomJoinCommand} className="form-control" spellCheck="false" />
                      </Button>

                      <Button variant="link" className="btn settings-menu"
                        onClick={toggleJoinConfirmationMessage}
                        title="Messages users in chat when they've successfully joined the Interested queue."
                      >
                        <input type="checkbox" role="switch"
                          checked={(settings?.enableJoinConfirmationMessage)} readOnly /> <span>Show Join Confirmation Message</span>
                      </Button>

                      <Button variant="link" className="btn settings-menu"
                        title="Replaces the !leave command with a custom term to use to leave all of the queues."
                      >
                        <span htmlFor="custom-leave-command">Use Custom Leave Command: </span>
                        <input type="text" id="custom-leave-command" name="custom-leave-command"
                          placeholder="e.g. !leave"
                          defaultValue={settings?.customLeaveCommand}
                          onChange={updateCustomLeaveCommand} className="form-control" spellCheck="false" />
                      </Button>

                      <Button variant="link" className="btn settings-menu"
                        onClick={toggleLeaveConfirmationMessage}
                        title="Messages users in chat when they've successfully left the queues."
                      >
                        <input type="checkbox" role="switch"
                          checked={(settings?.enableLeaveConfirmationMessage)} readOnly /> <span>Show Leave Confirmation Message</span>
                      </Button>

                      <Button variant="link" className="btn settings-menu"
                        title="Uses a custom character or emote to separate requests listed in the chat."
                      >
                        <span htmlFor="custom-delimiter">Use Custom Delimiter: </span>
                        <input type="text" id="custom-delimiter" name="custom-delimiter"
                          defaultValue={settings?.customDelimiter}
                          onChange={updateCustomDelimiter} className="form-control" spellCheck="false" />
                      </Button>
                    </div>
                  </div>
                </Collapse>
                {/* {optionMenuItems} */}
                <Nav.Link onClick={()=>this.props.showModalCommandList()}>View Chat Commands</Nav.Link>
                <Nav.Link onClick={this.props.toggleChangelogModal}>Changelog</Nav.Link>

                <div id="options-debug-menu-items" className="position-absolute bottom-0 start-0 end-0 pb-3 text-center">
                  <Dropdown id="dropdown-debug-menu-items" drop="up-centered" variant="link">
                    <Dropdown.Toggle id="dropdown-debug-menu-items-toggle" size="sm" variant="link" className="text-decoration-none">
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

              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    );
  }
}

const mapStateToProps = state => ({
  channelInfo: state.channel.user,
  modal: state.modal,
  moderatedChannels: state.user.moderatedChannels,
  userInfo: state.user.info,
});
const mapDispatchToProps = () => ({
  setChannelInfo,
  showModalCommandList,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps()
)(HeaderMenu);
