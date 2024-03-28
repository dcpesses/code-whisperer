/* eslint-env jest */
import { fireEvent, render, screen } from '@testing-library/react';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import { DefaultChatCommands } from '@/features/twitch-messages/message-handler';
import ModalCommandList from './index';
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

