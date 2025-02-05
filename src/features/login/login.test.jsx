/* eslint-env jest */
import {render} from '@testing-library/react';
import {vi} from 'vitest';
import Login from './index';
import React from 'react';

vi.mock('../../../package.json', () => {
  return {
    ...vi.importActual('../../../package.json'),
    version: '0.0.0'
  };
});

describe('Login', () => {
  describe('render', () => {
    beforeEach(()=>{
      vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
      vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
      vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');
    });
    afterEach(()=>{
      vi.unstubAllEnvs();
    });
    test('Should render as expected', () => {
      const {container} = render(
        <Login />
      );
      expect(container).toMatchSnapshot();
    });
    test('Should render without error in production', () => {
      vi.stubEnv('DEV', false);
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('Error Message');
      const {container} = render(
        <Login />
      );
      expect(container).toMatchSnapshot();
    });
    test('Should render with error during development', () => {
      vi.stubEnv('DEV', true);
      vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('Error Message');
      const {container} = render(
        <Login />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
