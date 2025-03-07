# Changelog

All notable changes will be documented in this file.


## 0.8.0 - 2025-03-06

* Updated all outdated dependencies...and there were a LOT.
* Updated components for accessibility compliance / WCAG.
* Added official CHANGELOG.md to project
* Updated What's New modal to pull content from CHANGELOG.md.
* Replaced in-app Ko-fi overlay with pop out link.


## 0.7.2 - 2025-02-14

* Fix: All text can be deleted from code textfield. (I know, I know.)
* Fix: Able to navigate to Github repo from corner banner.
* Added Changelog link to landing page.
* Updated landing page background animation.
* Updated accessibility navigation styles.
* And lastly, updated because of you... Happy Valentine's Day! ❤️


## 0.7.1 - 2025-02-07

* Updated app fonts and text styling
* Optimized page styles when viewed in an OBS panel
* Updated landing page with background animation and web browser frame
* Added app walkthrough background overlay to better highlight featured elements
* Added confirmation before resetting app data
* Updated ownership information in app license
* A plethora of other miscellaneous updates and tweaks 🛠️


## 0.7.0 - 2025-02-02

* **NEW!** Added app walkthrough for first time users
* Added link to app walkthrough to the Options menu
* Added setting for custom !queue command
* Added setting to enable the !queue command for all users or just streamer & moderators
* Updated landing page to include a brief app overview with screenshots
* Updated !version command to use the landing page url
* Updates to README in the project repository
* Moved/Graduated the Moderated Channels Menu option out of beta. 🎓
* Updated and increased unit-test coverage to aid in bug squashing 🐛


## 0.6.1 - 2024-04-19

* Updated to wait for previous whisper to finish before sending the next (when sending to the entire queue)
* Updated workaround for loading missing user info
* Fix: Prevent sending whispers to mock users


## 0.6.0 - 2024-04-12

* Fix: Users info no longer "undefined" when sending out codes
  * Should resolve the infamous Error 400: `to_user_id "undefined" must be numeric`
* Updated list of games returned via `!whichpack`
* Internal: Migrated Settings to use Redux store
* Updated and increased unit-test coverage to aid in bug squashing 🐛


## 0.5.6 - 2024-04-05

* Fix: Updated chat command routing (whoopsie daisy!)


## 0.5.5 - 2024-04-05

* Security updates and performance improvements
* **NEW!** Display an **“Add All to Queue”** button when everyone in the Interested queue can be added to the Playing queue
* Fix: Display &quot;Priority Seat&quot; styling to users added via `!adduser` command
* Fix: Prevent Ko-fi cookies from loading until menu button is clicked
* Migrated additional components to use Redux stores
* Fixed issue with chat client improperly disconnecting
* Minor UI tweaks
* Updated and increased unit-test coverage


## 0.5.0 - 2024-04-01

* Added Beta Options section to Settings menu
* Allow Twitch moderators to listen to chat commands on another stream.
  * Must opt-in under Settings -> Beta Options to enable
  * Only available on channels where the logged in user can moderate.
  * When enabled, moderated channels are listed in the new dropdown at the top left.
* New command `!queue` lists all of the people in the Playing queue
* Migrated several component states to use Redux stores
* Fixed issue with chat client improperly disconnecting
* Added in-app Ko-fi donation button with iframe overlay. Hey, why not.


## 0.4.0 - 2024-03-28

* **MAJOR** overhaul of the `MessageHandler` class to remove its reliance on React and increase its extensibility
* Added settings for custom `!join` and `!leave` commands
* Added settings to enable/disable chat confirmations for `!join` and `!leave` commands
* Added this Changelog modal, which should automatically show up the first time a new version is loaded.


## 0.3.1 - 2024-0-23

* Fixes issue with missing usernames
* Updated dummy data for unit-tests & debugging


## 0.3.0 - 2024-03-22

* Added extended information pane to bottom of player card in queues
* Added new icons to buttons, headings, and other elements
* Added new indicators to display status of last sent whisper
* Added detailed whisper status to extended information pane
* Fixed issue with Settings panel initially open
* Fixed layout issue with room code form


## 0.2.1 - 2024-03-18

* Added new menu option to view a list of all available chat commands
* Fix: updated README with the correct commands to add user to queue
* Updated Github project with license, code of conduct, donation, and support information
* Added GitHub bug report & issue templates


## 0.2.0 - 2024-03-16

* Added "Max # of Players" selection dropdown to the player count indicator
* Displays background color animation in Interested Queue while randomizing


## 0.1.0 - 2024-03-15

* Displays profile pic & username in navbar
* Added relative timestamp to players in queue
* Updated chat responses
* Fixed logout issue


## 0.0.3 - 2024-03-14


## 0.0.2 - 2024-03-13


## 0.0.1 - 2024-03-06
