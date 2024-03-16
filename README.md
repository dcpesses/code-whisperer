<div align="center" width="50%">

![Code Whisperer logo](/assets/logo-128.svg)

# Code Whisperer

Twitch Code Whisperer for Party Game Streamers

https://dcpesses.github.io/code-whisperer/

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/dcpesses/code-whisperer/blob/main/license)
[![ci](https://github.com/dcpesses/code-whisperer/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dcpesses/code-whisperer/actions)
[![codecov.io](https://codecov.io/gh/dcpesses/code-whisperer/coverage.svg?branch=main)](https://codecov.io/gh/dcpesses/code-whisperer?branch=master)

</div>

*****

Developed as a way to help streamers thwart Jackbox trolls, this tool gives Twitch streamers the power to decide who can play in games they host by sending invites only to users they approve.

<div align="center" width="50%">

![Early interface screenshot](/assets/screenshot.png)

</div>

> [!NOTE]
> Hey! This project is still actively in development and may change from these initial specs.

### Chat Commands

#### User Commands:
* `!join` - Adds the user to the Interested queue
* `!leave` - Removes the user from the Interested queue
* `!version` - Posts the version of the app and its url
* `!whichpack GAME` - replies with the Jackbox Party Pack of a given game
#### Mods / Streamer Commands:
* `!open` - Opens the interested queue
* `!close` - Closes the interested queue
* `!clear` - Removes all users from the board
* `!redeemseat @USER` - Adds user directly to Playing queue*
* `!removeuser @USER` - Removes user from all queues*

*NOTE: These commands will likely be renamed.

### Currently Planned Features:
- Setting the Max # of Players via Dropdown
- Displaying creation date of player's account
- In-app Documentation
- Usage instructions via command 
- Custom join/leave commands
- Using icons in place of text
- Player blacklisting
- Possible usage in other channels (Moderation privileges required)

### Related Repos
- https://asukii314.github.io/twitch-request-wheel/
- https://dcpesses.github.io/vite-react-ts-gh/
