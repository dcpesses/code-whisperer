import { fireEvent, render, screen } from '@testing-library/react';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import ModalCommandList from './index';
import { Store, UnknownAction } from '@reduxjs/toolkit';

describe('ModalCommandList', () => {
  let store: Store<unknown, UnknownAction, unknown>;
  beforeEach(() => {
    store = getStoreWithState();
  });
  test('Should render without modal', () => {
    const {container} = render(
      <Provider store={store}>
        <ModalCommandList />
      </Provider>
    );

    expect(container).toMatchSnapshot();
  });
  test('Should render with modal', () => {
    store.dispatch({ type: 'modal/showModalCommandList' });
    render(
      <Provider store={store}>
        <ModalCommandList />
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
        <ModalCommandList />
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
        <ModalCommandList />
      </Provider>
    );
    const modalElement = screen.getByRole('dialog');
    const button = screen.getByText('Close');
    fireEvent.click(button);
    expect(modalElement).toMatchSnapshot();
  });
});

