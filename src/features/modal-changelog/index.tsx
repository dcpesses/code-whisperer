import {Fragment, useState} from 'react';
import ModalReusable from '@/components/modal';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

import './modal-changelog.css';

interface ModalChangelogProps {
  handleClose: () => void;
  show: boolean;
}


export const changelogArray = [
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
    const listitems = items.map((item: string, idx: number) => (
      <li key={`changelog-v${version}-${idx}`}>
        {item}
      </li>
    ));
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
    <ModalReusable show={show} title="What's New" handleClose={handleClose}>
      <>
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
