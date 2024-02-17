import {render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {store} from './app/store';

import App from '@/App';

test('Should render as expected', () => {
  const {container} = render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(container).toMatchSnapshot();
});
test('Should render learn react link', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/learn/i)).toBeInTheDocument();
});
