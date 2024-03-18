import {
  hideModalCommandList,
  selectModalCommandList,
} from './modalSlice';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import './modal-command-list.css';

function ModalCommandList() {
  const show = useAppSelector(selectModalCommandList);
  const dispatch = useAppDispatch();

  const handleClose = () => dispatch( hideModalCommandList() );

  return (
    <Modal show={show} fullscreen="md-down" dialogClassName="modal-90w" onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>List of Available Chat Commands</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped>
          <thead>
            <tr>
              <th>Command</th>
              <th>Description</th>
              <th>Permission</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-monospace">!caniplay</td>
              <td>Adds the user to the Interested queue</td>
              <td>All users</td>
            </tr>
            <tr>
              <td className="font-monospace">!new</td>
              <td>Adds the user to the Interested queue (with no acknowledgement in chat)</td>
              <td>All users</td>
            </tr>
            <tr>
              <td className="font-monospace">!leave</td>
              <td>Removes the user from the Interested queue</td>
              <td>All users</td>
            </tr>
            <tr>
              <td className="font-monospace">!version</td>
              <td>Posts the version of the app and its url</td>
              <td>All users</td>
            </tr>
            <tr>
              <td className="font-monospace">!whichpack GAME</td>
              <td>replies with the Jackbox Party Pack of a given game</td>
              <td>All users</td>
            </tr>
            <tr>
              <td className="font-monospace">!open</td>
              <td>Opens the interested queue</td>
              <td>Mods / Streamer</td>
            </tr>
            <tr>
              <td className="font-monospace">!close</td>
              <td>Closes the interested queue</td>
              <td>Mods / Streamer</td>
            </tr>
            <tr>
              <td className="font-monospace">!clear</td>
              <td>Removes all users from the board</td>
              <td>Mods / Streamer</td>
            </tr>
            <tr>
              <td className="font-monospace">!redeemseat @USER</td>
              <td>Adds user directly to Playing queue*</td>
              <td>Mods / Streamer</td>
            </tr>
            <tr>
              <td className="font-monospace">!removeuser @USER</td>
              <td>Removes user from all queues*</td>
              <td>Mods / Streamer</td>
            </tr>
          </tbody>
        </Table>
        * Note: These will likely change in the next version
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalCommandList;
