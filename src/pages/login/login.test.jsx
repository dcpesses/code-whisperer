/* eslint-env jest */
import {render} from '@testing-library/react';
import {vi} from 'vitest';
import Login from './index';
import React from 'react';

describe('Login', () => {
  describe('render', () => {
    test('Should render as expected', () => {
      vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
      vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
      vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');

      const {container} = render(
        <Login />
      );
      expect(container).toMatchSnapshot();

      vi.unstubAllEnvs();
    });
  });
});
