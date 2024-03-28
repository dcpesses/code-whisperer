import { fireEvent, render, screen } from '@testing-library/react';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import ModalCommandList from './index';
import { chatCommands } from '@/features/twitch-messages/message-handler';
import { Store, UnknownAction } from '@reduxjs/toolkit';

const defaultChatCommands = Object.assign({},
  ...Object.values(chatCommands).map(
    cmdObj => cmdObj.commands.map(
      command => ({
        [`${command}`]: cmdObj}
      )
    )
  ).flat()
);

describe('ModalCommandList', () => {
  let store: Store<unknown, UnknownAction, unknown>;
  beforeEach(() => {
    store = getStoreWithState();
  });
  test('Should render without modal', () => {
    const {container} = render(
      <Provider store={store}>
        <ModalCommandList chatCommands={defaultChatCommands} />
      </Provider>
    );

    expect(container).toMatchSnapshot();
  });
  test('Should render with modal', () => {
    store.dispatch({ type: 'modal/showModalCommandList' });
    render(
      <Provider store={store}>
        <ModalCommandList chatCommands={defaultChatCommands} />
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
        <ModalCommandList chatCommands={defaultChatCommands} />
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
        <ModalCommandList chatCommands={defaultChatCommands} />
      </Provider>
    );
    const modalElement = screen.getByRole('dialog');
    const button = screen.getByText('Close');
    fireEvent.click(button);
    expect(modalElement).toMatchSnapshot();
  });
});

