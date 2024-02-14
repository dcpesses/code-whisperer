import {fireEvent, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {store} from './app/store';

import App from '@/App';

test('Should render learn react link', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/learn/i)).toBeInTheDocument();
});

test('Should display state counter value', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(screen.getByText('State Counter is: 0')).toBeDefined();
});

test('Should increment and display state counter value', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const button = screen.getByTitle('State Counter');
  fireEvent.click(button);
  expect(screen.getByText('State Counter is: 1')).toBeDefined();
});
