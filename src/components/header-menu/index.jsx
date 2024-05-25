
import {Component} from 'react';
import {connect} from 'react-redux';
import {Button, CloseButton, Collapse, Dropdown, OverlayTrigger} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { setChannelInfo } from '@/features/twitch/channel-slice';
import { showModalCommandList } from '@/features/modal-command-list/modalSlice';
import { showOnboarding } from '@/features/onboarding/onboarding-slice';
// import OptionsGameList from './OptionsGameList';
import PropTypes from 'prop-types';
import {version} from '../../../package.json';

import './header-menu.css';
import KofiSvg from '@/assets/kofi.svg';

export const noop = () => void 0;

export class HeaderMenu extends Component {
  static get propTypes() {
    return {
      clearAllQueues: PropTypes.func,
      channelInfo: PropTypes.object,
      debugItems: PropTypes.array,
      // gamesList: PropTypes.object,
      moderatedChannels: PropTypes.array,
      onLogout: PropTypes.func,
      onSettingsUpdate: PropTypes.func,
      settings: PropTypes.object,
      setChannelInfo: PropTypes.func,
      showModalCommandList: PropTypes.func,
      showOnboarding: PropTypes.func,
      toggleChangelogModal: PropTypes.func,
      twitchApi: PropTypes.object,
      userInfo: PropTypes.object,
    };
  }
  static get defaultProps() {
    return {
      clearAllQueues: noop,
      channelInfo: {},
      debugItems: [],
      gamesList: {
        allowedGames: null,
        validGames: null
      },
      moderatedChannels: [],
      onLogout: noop,
      onSettingsUpdate: noop,
      settings: {},
      setChannelInfo: noop,
      showModalCommandList: noop,
      showOnboarding: noop,
      toggleChangelogModal: noop,
      twitchApi: null,
      userInfo: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      showKofiOverlay: false,
      showGameList: false,
      showOptionsMenu: false,
      showSettingsMenu: false,
    };
    this.toggleGameList = this.toggleGameList.bind(this);
    this.toggleKofiOverlay = this.toggleKofiOverlay.bind(this);
    this.toggleSettingsMenu = this.toggleSettingsMenu.bind(this);

    this.updateCustomDelimiter = this.updateInputOption.bind(this, 'customDelimiter');
    this.updateCustomJoinCommand = this.updateInputOption.bind(this, 'customJoinCommand');
    this.updateCustomLeaveCommand = this.updateInputOption.bind(this, 'customLeaveCommand');

    this.toggleEnableRoomCode = this.toggleOption.bind(this, 'enableRoomCode', true);
    this.toggleJoinConfirmationMessage = this.toggleOption.bind(this, 'enableJoinConfirmationMessage', true);
    this.toggleLeaveConfirmationMessage = this.toggleOption.bind(this, 'enableLeaveConfirmationMessage', true);
    this.toggleEnableModeratedChannelsOption = this.toggleOption.bind(this, 'enableModeratedChannelsOption', false);

    this.offcanvasRef;
  }

  /**
   * Creates an array of DropdownItems using a given object array
   * @param {array} items Array of objects to transform into DropdownItems; Each object contains:
   *   `label` {string} Label to display on the DropdownItem,
   *   `onClick` {function} Callback fired when the DropdownItem is clicked
   * @param {string} activeLabel (optional) Label of the DropdownItem to highlight as active/selected.
   * @returns array of DropdownItems
   */
  createDropdownItems = (items, activeLabel=null) => {
    if (!items) {return [];}

    return items.map((i, idx) => {
      if (!i || !i.label) {return null;}
      // create divider if label only contains dashes
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

  /**
   * Generates the menu items to display in the Moderated Channels dropdown
   * @param {string} activeLabel (optional) Label of the DropdownItem to highlight as active/selected.
   * @returns JSX.Element of Dropdown Menu Items
   */
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
        {this.createDropdownItems(items.slice(0, 1), activeLabel)}
        <Dropdown.Divider />
        {this.createDropdownItems(items.slice(1), activeLabel)}
      </>
    );
  };

  onModeratedChannelMenuItem = async(channel) => {
    try {
      let channelInfo = await this.props.twitchApi.switchChannel(channel.broadcaster_login);
      channelInfo = (!channelInfo) ? this.props.channelInfo : channelInfo.data[0];

      this.props.setChannelInfo(channelInfo);
      this.props.clearAllQueues();
      return;
    } catch (e) {
      console.error(`getModeratedChannelsMenu - ${channel.broadcaster_name} - error`, e);
    }
  };

  onViewWalkthrough = () => {
    this.setState({
      showOptionsMenu: false
    });
    this.props.showOnboarding();
  };

  sanitizeInputEventTargetValue = (e) => {
    let {value} = e.target;
    if (!value) {
      return null;
    } else {
      return value.trim();
    }
  };

  toggleKofiOverlay = () => this.setState((state) => ({showKofiOverlay: !state.showKofiOverlay}));
  toggleGameList = () => this.setState((state) => ({showGameList: !state.showGameList}));
  toggleOptionsMenu = () => this.setState((state) => ({showOptionsMenu: !state.showOptionsMenu}));
  toggleSettingsMenu = () => this.setState((state) => ({showSettingsMenu: !state.showSettingsMenu}));

  /**
   * Toggles the value of the specified option in the settings
   * @param {string} optionName Name of the setting to change
   * @param {boolean} defaultValue (optional) Value to assign if not yet initialized. Default: `true`
   */
  toggleOption = (optionName, defaultValue=true /*, evt*/) => {
    if (typeof optionName !== 'string') {return;}
    const {settings, onSettingsUpdate} = this.props;
    let value = (typeof settings?.[optionName] === 'boolean')
      ? !settings[optionName]
      : defaultValue;

    /*
    // debug clicks on sibling elements
    if (evt.target?.type !== 'checkbox') {
      if (evt.target?.nextElementSibling?.type === 'checkbox') {
        evt = evt.target.nextElementSibling;
      } else if (evt.target?.previousElementSibling?.type === 'checkbox') {
        evt = evt.target.previousElementSibling;
      }
    }

    if (evt.target?.type === 'checkbox') {
      value = evt.target.checked;
    }
    */

    onSettingsUpdate({[optionName]: value});
    return;
  };

  updateInputOption = (optionName, e) => {
    if (typeof optionName !== 'string' || !e?.target) {return;}
    this.props.onSettingsUpdate({[optionName]: this.sanitizeInputEventTargetValue(e)});
    return;
  };

  render() {
    let {channelInfo, debugItems, userInfo, settings/*, onSettingsUpdate*/} = this.props;
    const debugMenuItems = this.createDropdownItems(debugItems);

    // user may not always be same as broadcaster/channel
    let selectedUserInfo = channelInfo;
    let displayName = channelInfo.display_name;
    let isUserChannel = (channelInfo.login === userInfo.login);

    let img;
    if (selectedUserInfo.profile_image_url) {
      img = (
        <>
          {!isUserChannel && (
            <img
              src={userInfo.profile_image_url}
              className="rounded-circle navbar-pfp-img proxy-profile-img"
              alt={userInfo.display_name}
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
    const navbarBrand = (
      <Navbar.Brand className="fw-semibold">{img} {displayName}</Navbar.Brand>
    );
    let dropdownNavbarBrand = navbarBrand;
    if (settings.enableModeratedChannelsOption) {
      window.console.log('channelInfo.display_name:', channelInfo.display_name);
      let moderatedChannelsMenuItems = this.createModeratedChannelsMenuItems(channelInfo.display_name);
      dropdownNavbarBrand = (
        <Dropdown id="dropdown-moderated-channels" variant="link">
          <Dropdown.Toggle id="dropdown-moderated-channels-toggle" size="sm" variant="link" className="text-decoration-none text-white px-0">
            {navbarBrand}
          </Dropdown.Toggle>
          <Dropdown.Menu variant="dark">
            {moderatedChannelsMenuItems}
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return (
      <Navbar expand={false} data-bs-theme="dark" className="bg-body-tertiary mb-3 py-0 raleway-font" onToggle={this.toggleOptionsMenu}>
        <Container fluid>

          {dropdownNavbarBrand}

          <Navbar.Toggle aria-controls="navbar-options-menu" className="border-0 rounded-0" />
          <Navbar.Offcanvas
            id="navbar-options-menu"
            aria-labelledby="navbar-options-menu-label"
            placement="end"
            className="raleway-font"
            show={this.state.showOptionsMenu}
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
                        onClick={this.toggleEnableRoomCode}
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
                          onChange={this.updateCustomJoinCommand} className="form-control" spellCheck="false" />
                      </Button>

                      <Button variant="link" className="btn settings-menu"
                        onClick={this.toggleJoinConfirmationMessage}
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
                          onChange={this.updateCustomLeaveCommand} className="form-control" spellCheck="false" />
                      </Button>

                      <Button variant="link" className="btn settings-menu"
                        onClick={this.toggleLeaveConfirmationMessage}
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
                          onChange={this.updateCustomDelimiter} className="form-control" spellCheck="false" />
                      </Button>


                      <hr className="border-bottom my-2" />

                      <h5>Beta Options</h5>
                      <div className="smaller">
                        These options have not been fully tested and may not work as intended.
                      </div>

                      <Button variant="link" id="enable-moderated-channels-option" className="btn settings-menu"
                        onClick={this.toggleEnableModeratedChannelsOption}
                        title="Allows user to use this app on another channel that grants them moderation access."
                      >
                        <input type="checkbox" role="switch" checked={(settings?.enableModeratedChannelsOption)} readOnly /> <span>Enable Moderated Channels Menu</span>
                      </Button>

                    </div>
                  </div>
                </Collapse>
                {/* {optionMenuItems} */}
                <Nav.Link onClick={()=>this.props.showModalCommandList()}>View Chat Commands</Nav.Link>
                <Nav.Link onClick={this.onViewWalkthrough}>View Walkthrough</Nav.Link>
                <Nav.Link onClick={this.props.toggleChangelogModal}>What&apos;s New</Nav.Link>

                <div id="options-debug-menu-items" className="position-absolute bottom-0 start-0 end-0 pb-3 text-center">
                  <OverlayTrigger
                    show={this.state.showKofiOverlay}
                    onToggle={this.toggleKofiOverlay}
                    trigger="click"
                    placement="top"
                    overlay={
                      <div className="kofi-overlay" style={{zIndex: 1046}}>
                        {
                          (this.state.showKofiOverlay) && (
                            <iframe id="kofiframe" src="https://ko-fi.com/dcpesses/?hidefeed=true&widget=true&embed=true&preview=true" height="640" title="dcpesses"></iframe>
                          )
                        }
                        <div className="position-absolute top-0 end-0 p-2">
                          <CloseButton id="close-kofi-overlay" onClick={this.toggleKofiOverlay} />
                        </div>
                      </div>
                    }
                  >
                    <Nav.Link title="Wanna support the development of Code Whisperer? Donations are never expected but are always appreciated!">
                      <img src={KofiSvg} alt="Support Me on Ko-fi" />
                    </Nav.Link>
                  </OverlayTrigger>
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
  settings: state.settings.app,
  userInfo: state.user.info,
});
const mapDispatchToProps = () => ({
  setChannelInfo,
  showModalCommandList,
  showOnboarding,
});
export default connect(
  mapStateToProps,
  mapDispatchToProps()
)(HeaderMenu);
