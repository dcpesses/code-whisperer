import {render} from '@testing-library/react';
import {HashRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from '@/app/store';

import App from '@/App';

describe('App', () => {
  test('Should render as expected', () => {
    const {container} = render(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>
    );

    expect(container).toMatchSnapshot();
  });
  test('should detect required environment build variables', () => {
    expect(import.meta.env.VITE_APP_TWITCH_CLIENT_ID).toBeDefined();
    expect(import.meta.env.VITE_APP_TWITCH_CLIENT_SECRET).toBeDefined();
    expect(import.meta.env.VITE_APP_REDIRECT_URI).toBeDefined();
    expect(import.meta.env.VITE_APP_REDIRECT_URI_NOENCODE).toBeDefined();
  });
});
