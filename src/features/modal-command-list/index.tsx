import { Fragment, JSX } from 'react';
import {
  hideModalCommandList,
  selectModalCommandList,
} from './modalSlice';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import ModalReusable from '@/components/modal';
import Table from 'react-bootstrap/Table';
import './modal-command-list.css';

type chatResponseFunctionType = (scope: unknown, username: string, message: string) => boolean;

interface ChatCommand {
  commands: string[];
  displayName: string;
  description: string;
  id: string;
  mod: boolean;
  response: chatResponseFunctionType;
}

interface ModalCommandListProps {
  chatCommands: Array<ChatCommand>;
}

const commaSeparatedElements = (cmd: string, idx: number, arr: string[]) => {
  const c = <span key={cmd} className="chat-command">{cmd}</span>;
  if (idx !== arr.length - 1) { // can contain multiple commands
    return [c, <Fragment key={idx}>, </Fragment>];
  }
  return c;
};

function ModalCommandList( {chatCommands}: ModalCommandListProps): JSX.Element {
  const show = useAppSelector(selectModalCommandList);
  const dispatch = useAppDispatch();

  const handleClose = () => dispatch( hideModalCommandList() );

  const renderTableRow = (chatCommand: ChatCommand): JSX.Element => {
    const {commands, description, mod} = chatCommand;
    return (
      <tr key={commands.join('-')}>
        <td className="chat-command-list">
          {commands.flatMap(commaSeparatedElements)}
        </td>
        <td>{description}</td>
        <td>{mod ? 'Mods / Streamer' : 'All users'}</td>
      </tr>
    );
  };

  return (
    <ModalReusable id="modal-command-list" show={show} title="List of Available Chat Commands" handleClose={handleClose}>
      <Table striped>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
            <th>Permission</th>
          </tr>
        </thead>
        <tbody>
          {!!chatCommands && chatCommands.map(renderTableRow)}
        </tbody>
      </Table>
    </ModalReusable>
  );
}

export default ModalCommandList;
export {commaSeparatedElements};
