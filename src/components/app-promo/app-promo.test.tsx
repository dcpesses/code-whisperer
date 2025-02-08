import {render} from '@testing-library/react';
import AppPromo from './index';

describe('AppPromo', () => {
  beforeEach(()=>{
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
    vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');
  });
  afterEach(()=>{
    vi.unstubAllEnvs();
  });
  test('Should render as expected', () => {
    const {container} = render(<AppPromo />);
    expect(container).toMatchSnapshot();
  });
});
