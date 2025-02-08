/* eslint-env jest */
import { fireEvent, render, screen } from '@testing-library/react';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import { DefaultChatCommands } from '@/features/twitch-messages/message-handler';
import ModalCommandList, {commaSeparatedElements} from './index';
import { Store, UnknownAction } from '@reduxjs/toolkit';

type chatResponseFunctionType = (scope: unknown, username: string, message: string) => boolean;

interface ChatCommand {
  commands: string[];
  displayName: string;
  description: string;
  id: string;
  mod: boolean;
  response: chatResponseFunctionType;
}

describe('commaSeparatedElements', () => {

  test('Should return chat commands wrapped in span elements', () => {

    const chatCommands:ChatCommand[] = [{
      commands: ['!join'],
      displayName: 'join',
      description: 'Adds the user to the Interested queue',
      id: 'joinQueue',
      mod: false,
      response: vi.fn()
    }, {
      commands: ['!leave'],
      displayName: 'leave',
      description: 'Removes the user from the Interested queue',
      id: 'leaveQueue',
      mod: false,
      response: vi.fn()
    }, {
      commands: ['!queue', '!q'],
      displayName: 'queue',
      description: 'List all the players currently in the Playing queue',
      id: 'listQueue',
      mod: true,
      response: vi.fn()
    }];

    const result = chatCommands.map(
      (chatCommand: ChatCommand) => chatCommand.commands.flatMap(commaSeparatedElements)
    );

    expect(result).toMatchSnapshot();
  });
});

describe('ModalCommandList', () => {
  let chatCommands: ChatCommand[];

  let store: Store<unknown, UnknownAction, unknown>;
  beforeEach(() => {
    store = getStoreWithState();
    chatCommands = DefaultChatCommands;
  });
  test('Should render without modal', () => {
    const {container} = render(
      <Provider store={store}>
        <ModalCommandList chatCommands={chatCommands} />
      </Provider>
    );

    expect(container).toMatchSnapshot();
  });
  test('Should render with modal', () => {
    store.dispatch({ type: 'modal/showModalCommandList' });
    render(
      <Provider store={store}>
        <ModalCommandList chatCommands={chatCommands} />
      </Provider>
    );
    const modalElement = screen.getByRole('dialog');

    expect(modalElement).toHaveTextContent('List');
    expect(modalElement).toMatchSnapshot();
  });

  test('Should render with modal and close on top-right button press', () => {
    store.dispatch({ type: 'modal/showModalCommandList' });
    render(
      <Provider store={store}>
        <ModalCommandList chatCommands={chatCommands} />
      </Provider>
    );
    const modalElement = screen.getByRole('dialog');
    const button = screen.getByLabelText('Close');
    fireEvent.click(button);
    expect(modalElement).toMatchSnapshot();
  });

  test('Should render with modal and close on top-right button press', () => {
    store.dispatch({ type: 'modal/showModalCommandList' });
    render(
      <Provider store={store}>
        <ModalCommandList chatCommands={chatCommands} />
      </Provider>
    );
    const modalElement = screen.getByRole('dialog');
    const button = screen.getByText('Close');
    fireEvent.click(button);
    expect(modalElement).toMatchSnapshot();
  });
});

