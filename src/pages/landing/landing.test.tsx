import {render} from '@testing-library/react';
import Landing from './index';

vi.mock('../../../package.json', () => {
  return {
    ...vi.importActual('../../../package.json'),
    version: '0.0.0'
  };
});

describe('Landing', () => {
  beforeEach(()=>{
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
    vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');
  });
  afterEach(()=>{
    vi.unstubAllEnvs();
  });
  test('Should render as expected', () => {
    const {container} = render(<Landing />);
    expect(container).toMatchSnapshot();
  });
});
