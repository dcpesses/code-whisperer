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
});
