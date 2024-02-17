import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as counterAPI from './counterAPI';

import { getStoreWithState } from '../../app/store';
import { Provider } from 'react-redux';
import { ReduxCounter } from './ReduxCounter';
import { Store, UnknownAction } from '@reduxjs/toolkit';

describe('ReduxCounter', () => {
  let store: Store<unknown, UnknownAction, unknown>;
  beforeEach(() => {
    store = getStoreWithState();
  });
  test('Should render as expected', () => {
    const {container} = render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );

    expect(container).toMatchSnapshot();
  });
  test('Should render and display state counter value', () => {
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = screen.getByLabelText('Counter value', {selector: 'span'});

    expect(counterElement).toHaveTextContent('0');
    expect(counterElement).toMatchSnapshot();
  });

  test('Should increment and display updated counter value', () => {
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Increment value');

    expect(counterElement()).toHaveTextContent('0');

    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('1');
  });

  test('Should decrement and display updated counter value', () => {
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Decrement value');

    expect(counterElement()).toHaveTextContent('0');

    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('-1');
  });

  test('Should increment counter using numeric input amount', () => {
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Add increment amount');

    expect(counterElement()).toHaveTextContent('0');

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('2');
    fireEvent.change(input, {target: {value: '3'}});
    expect(input).toHaveValue('3');

    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('3');

  });
  test('Should async increment counter using numeric input amount', async() => {
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    expect(counterElement()).toHaveTextContent('0');
    expect(screen.getByRole('textbox')).toHaveValue('2');

    const button = screen.getByLabelText('Add async increment amount');

    fireEvent.click(button);

    await waitFor(() => expect(counterElement()).toHaveTextContent('2'));
  });
  test('Should handle async error when incrementing counter using numeric input amount', async() => {
    vi.spyOn(counterAPI, 'fetchCount').mockRejectedValue({});
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Add async increment amount');

    fireEvent.click(button);

    await waitFor(() => expect(counterElement()).toHaveTextContent('0'));
  });
  test('Should increment counter only when counter value is odd using numeric input amount', () => {
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    expect(counterElement()).toHaveTextContent('0');
    expect(screen.getByRole('textbox')).toHaveValue('2');

    // confirm counter will not increment
    const button = screen.getByLabelText('Add increment amount if odd');
    fireEvent.click(button);
    expect(counterElement()).toHaveTextContent('0');

    // set counter to odd value
    fireEvent.click(screen.getByLabelText('Increment value'));
    expect(counterElement()).toHaveTextContent('1');

    // confirm counter increments
    fireEvent.click(button);
    expect(counterElement()).toHaveTextContent('3');
  });
  test('Should handle invalid input values', () => {
    render(
      <Provider store={store}>
        <ReduxCounter />
      </Provider>
    );
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Add increment amount');

    expect(counterElement()).toHaveTextContent('0');

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'f'}});
    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('0');
  });
});

