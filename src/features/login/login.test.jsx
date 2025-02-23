/* eslint-env jest */
import {render, screen, fireEvent} from '@testing-library/react';
import {vi} from 'vitest';
import Login, {getLoginUrl} from './index';
import React from 'react';

vi.mock('../../../package.json', () => {
  return {
    ...vi.importActual('../../../package.json'),
    version: '0.0.0'
  };
});

describe('getLoginUrl', () => {
  test('should return twitch oauth url', () => {
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_ID', 'VITE_APP_TWITCH_CLIENT_ID');
    vi.stubEnv('VITE_APP_TWITCH_CLIENT_SECRET', 'VITE_APP_TWITCH_CLIENT_SECRET');
    vi.stubEnv('VITE_APP_REDIRECT_URI', 'VITE_APP_REDIRECT_URI');

    expect(getLoginUrl()).toEqual('https://id.twitch.tv/oauth2/authorize?client_id=VITE_APP_TWITCH_CLIENT_ID&response_type=code&scope=chat:read chat:edit moderation:read user:manage:whispers moderator:read:chatters user:read:moderated_channels channel:read:vips channel:read:editors moderator:manage:announcements user:read:subscriptions&redirect_uri=VITE_APP_REDIRECT_URI');
  });
});

describe('Login', () => {
  describe('clearLocalStorageData', () => {
    test('should call setState', () => {
      vi.useFakeTimers({ toFake: ['nextTick'] });
      const component = new Login();
      vi.spyOn(component, 'setState').mockImplementation(()=>{});
      vi.spyOn(global, 'setTimeout');
      component.clearLocalStorageData();
      vi.advanceTimersByTime(5500);
      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      global.setTimeout.mock.calls[0][0]();
      // console.log({calls: global.setTimeout.mock.calls[0][0]})

      expect(component.setState).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });
  });
  describe('toggleChangelogModal', () => {
    test('should toggle the state of showChangelogModal', () => {
      const component = new Login();
      vi.spyOn(component, 'setState');
      component.state.showChangelogModal = false;
      component.toggleChangelogModal();
      expect(component.setState.mock.calls[0][0](component.state)).toEqual({ showChangelogModal: true });
    });
  });
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
    test('Should render and handle modal events', async() => {
      vi.useFakeTimers({ toFake: ['nextTick'] });
      render(
        <Login />
      );
      const btnResetAppData = screen.getByText('Having issues?');
      const spanResetAppData = screen.getByText('Reset application data');
      expect(spanResetAppData.classList.contains('checkmark-display')).toBeFalsy();

      fireEvent.click(btnResetAppData);
      vi.advanceTimersByTime(1500);

      const dialogElement = await screen.findByRole('dialog');
      expect(dialogElement.classList.contains('show')).toBeTruthy();
      expect(dialogElement).toHaveTextContent('Are you sure you want to reset the application data');

      fireEvent.click(await screen.findByText('Cancel'));
      vi.advanceTimersByTime(1500);
      expect(dialogElement.classList.contains('show')).toBeFalsy();

      fireEvent.click(btnResetAppData);
      vi.advanceTimersByTime(1500);
      expect(dialogElement.classList.contains('show')).toBeTruthy();

      fireEvent.click(await screen.findByText('Reset'));
      vi.advanceTimersByTime(1500);
      expect(dialogElement.classList.contains('show')).toBeFalsy();

      expect(spanResetAppData.classList.contains('checkmark-display')).toBeTruthy();

      vi.useRealTimers();
    });
    test('Should render without error in production', () => {
      vi.stubEnv('DEV', false);
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue('Error Message');
      const {container} = render(
        <Login />
      );
      expect(container).toMatchSnapshot();
    });
    test('Should render with error during development', () => {
      vi.stubEnv('DEV', true);
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue('Error Message');
      const {container} = render(
        <Login />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
