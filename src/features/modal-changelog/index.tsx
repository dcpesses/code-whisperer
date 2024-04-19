import {Fragment, useState} from 'react';
import ModalReusable from '@/components/modal';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

import './modal-changelog.css';

interface ModalChangelogProps {
  handleClose: () => void;
  show: boolean;
}


export const changelogArray = [
  {'0.6.1': [
    'Updated to wait for previous whisper to finish before sending the next (when sending to the entire queue)',
    'Updated workaround for loading missing user info',
    'Fix: Prevent sending whispers to mock users',
  ]},
  {'0.6.0': [
    'Fix: Users info no longer "undefined" when sending out codes',
    [
      (
        <>
          Should resolve the infamous Error 400: <span className="font-monospace small bg-secondary-subtle">to_user_id &quot;undefined&quot; must be numeric</span>
        </>
      )
    ],
    (
      <>
        Updated list of games returned via <span className="font-monospace">!whichpack</span>
      </>
    ),
    'Internal: Migrated Settings to use Redux store',
    'Updated and increased unit-test coverage to aid in bug squashing 🐛',
  ]},
  {'0.5.6': [
    'Fix: Updated chat command routing (whoopsie daisy!)',
  ]},
  {'0.5.5': [
    'Security updates and performance improvements',
    (
      <>
        <Badge pill bg="warning" className="smaller align-text-bottom text-black">NEW!</Badge> Display an <b>&ldquo;Add All to Queue&rdquo;</b> button when everyone in the Interested queue can be added to the Playing queue
      </>
    ),
    (
      <>
        Fix: Display &quot;Priority Seat&quot; styling to users added via <span className="font-monospace">!adduser</span> command
      </>
    ),
    'Fix: Prevent Ko-fi cookies from loading until menu button is clicked',
    'Migrated additional components to use Redux stores',
    'Fixed issue with chat client improperly disconnecting',
    'Minor UI tweaks',
    'Updated and increased unit-test coverage',
  ]},
  {'0.5.0': [
    'Added Beta Options section to Settings menu',
    'Allow Twitch moderators to listen to chat commands on another stream.',
    [
      'Must opt-in under Settings -> Beta Options to enable ',
      'Only available on channels where the logged in user can moderate.',
      'When enabled, moderated channels are listed in the new dropdown at the top left.',
    ],
    'New command `!queue` lists all of the people in the Playing queue',
    'Migrated several component states to use Redux stores',
    'Fixed issue with chat client improperly disconnecting',
    'Added in-app Ko-fi donation button with iframe overlay. Hey, why not.',
  ]},
  {'0.4.0': [
    (
      <>
        <b>MAJOR</b> overhaul of the MessageHandler class to remove its reliance on React and increase its extensibility
      </>
    ),
    'Added settings for custom !join and !leave commands',
    'Added settings to enable/disable chat confirmations for !join and !leave commands',
    'Added this Changelog modal, which should automatically show up the first time a new version is loaded.',
  ]},
  {'0.3.1': [
    'Fixes issue with missing usernames',
    'Updated dummy data for unit-tests & debugging',
  ]},
  {'0.3.0': [
    'Added extended information pane to bottom of player card in queues',
    'Added new icons to buttons, headings, and other elements',
    'Added new indicators to display status of last sent whisper',
    'Added detailed whisper status to extended information pane',
    'Fixed issue with Settings panel initially open',
    'Fixed layout issue with room code form',
  ]},
  {'0.2.1': [
    'Added new menu option to view a list of all available chat commands',
    'Fix: updated README with the correct commands to add user to queue',
    'Updated Github project with license, code of conduct, donation, and support information',
    'Added GitHub bug report & issue templates',
  ]},
  {'0.2.0': [
    'Added "Max # of Players" selection dropdown to the player count indicator',
    'Displays background color animation in Interested Queue while randomizing',
  ]},
  {'0.1.0': [
    'Displays profile pic & username in navbar',
    'Added relative timestamp to players in queue',
    'Updated chat responses',
    'Fixed logout issue',
  ]}
];

function ModalChangelog(props: ModalChangelogProps): JSX.Element {
  const {handleClose, show} = props;
  const [showPastUpdates, setShowPastUpdates] = useState<boolean>(false);

  const renderLog = (log: object) => {
    const [[version, items]] = Object.entries(log);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listitems = items.map((item: any, idx: number) => {
      if (item.map) {
        return (
          <ul key={`changelog-v${version}-${idx}`} className="ms-5">
            {
              item.map((subitem: string, subidx: number) => (
                <li key={`changelog-v${version}-${idx}-${subidx}`}>
                  {subitem}
                </li>
              ))
            }
          </ul>
        );
      }

      return (
        <li key={`changelog-v${version}-${idx}`}>
          {item}
        </li>
      );
    });
    return (
      <Fragment key={`changelog-v${version}`}>
        <strong>
          Version {version}
        </strong>
        <ul className="ms-5">
          {listitems}
        </ul>
      </Fragment>
    );
  };

  return (
    <ModalReusable id="modal-changelog" show={show} title="What's New" handleClose={handleClose}>
      <>
        {/* <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="bi-exclamation-triangle-fill fs-1"></i>
          <div className="ms-3">
            <b>HEADS UP!</b> If you&apos;re reading this notice for the first time, you may need to log out and log back in to approve additional permissions in order for some new and upcoming features to work correctly.
          </div>
        </div> */}

        {renderLog(changelogArray[0])}
        <hr />
        <Collapse in={showPastUpdates}>
          <div id="past-updates-collapse">
            <div className="pb-3">
              <h5 className="fw-light pb-2">Past Updates</h5>
              {changelogArray.slice(1).map(log => renderLog(log))}
            </div>
          </div>
        </Collapse>
        <Button
          variant="link"
          className="text-center mx-auto p-0 text-decoration-none text-white"
          aria-controls="past-updates-collapse"
          aria-expanded={showPastUpdates}
          onClick={() => setShowPastUpdates(!showPastUpdates)}
        >
          Toggle Past Updates
        </Button>
      </>
    </ModalReusable>
  );
}

export default ModalChangelog;
