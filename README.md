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

Developed as a way to help streamers thwart Jackbox trolls, this tool gives Twitch streamers the power to decide who can play in games they host by sending invites only to approved users.

> [!NOTE]
> Hey! This project is still actively in development and may be subject to change without notice. YMMV.

## Overview
<img src="/assets/screenshot.png" alt="app interface screenshot" align="right" width="25%" />
The app uses two queues, Interested and Playing, which allows a streamer to manage who will
be whispered. Users indicate if they want to join a game by entering commands in chat, which automatically adds them to the Interested queue. From there, the streamer can move users to and from the Playing queue; when a code is entered in the text form, all users in the Playing queue will be sent the code via a Twitch whisper.

### Features
- Sends game or lobby code to specific users by Twitch whisper (direct message)
- Can send to all users at once as well as individually
- Easy for users to join using commands in Twitch chat
- No additional login necessary from users willing to play
- Option to randomize user selection
- Set the Max # of Players via Dropdown
- NEW: Indicates if issues occur sending whispers
- More features coming soon...

### Caveats
- Users must be able to receive whispers
- App must remain open in an active browser window to receive commands
- Number of whispers sent is subject to [rate limits](https://dev.twitch.tv/docs/irc/#rate-limits)

### Chat Commands

#### User Commands:
* `!join` - Adds the user to the Interested queue
* `!new` - Adds the user to the Interested queue without notifying chat
* `!leave` - Removes the user from all queues
* `!version` - Posts the version of the app and its url
* `!whichpack GAME` - replies with the Jackbox Party Pack of a given game
* `!commands` - Lists all available commands
#### Mods / Streamer Commands:
* `!open` - Opens the Interested queue
* `!close` - Closes the Interested queue
* `!clear` - Removes all users from the queues
* `!clearopen` - Removes all users from the queues and reopens the Interested queue
* `!adduser @USER` - Adds specified user directly to Playing queue
* `!removeuser @USER` - Removes specified user from all queues

### Currently Planned Features:
- [x] Display creation date of player's account
- [ ] In-app Documentation & Tutorial
- [ ] Usage instructions via command
- [ ] Custom join/leave commands
- [x] Using icons in place of text
- [ ] Game description lookup via command
- [ ] Player blacklisting
- [ ] Possible usage in other channels (Moderation privileges required)

## Support

- [GitHub Discussions](https://github.com/dcpesses/code-whisperer/discussions) - 💡 Questions, Feedback & Feature Requests
- [GitHub Issues](https://github.com/dcpesses/code-whisperer/issues) - 🕷️ Bugs and Issues

## License and Contributor Code of Conduct

This project is open source under the MIT license. (TL;DR: you may access the source code and modify it to fit your own needs, but you do not have access to deploy it.)

Contributors must subscribe and adhere to the [Contributor Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) based on the [Contributor Covenant](http://contributor-covenant.org) version 2.1.


## Shut up and take my money!

If you would like to support the development of Code Whisperer, feel free to donate at [☕️ ko-fi](https://ko-fi.com/V7V6VSUT1). Donations are never expected but are always appreciated. All donations are non-refundable and go towards improving the app and its infrastructure.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V6VSUT1)


### Related Repos
- https://asukii314.github.io/twitch-request-wheel/
- https://dcpesses.github.io/vite-react-ts-gh/
