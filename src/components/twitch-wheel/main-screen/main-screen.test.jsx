/* eslint-env jest */
import { render } from '@testing-library/react';
import {vi} from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { getStoreWithState } from '@/app/store';
import MainScreen from './index';

vi.mock('../../../../package.json', () => {
  return {
    ...vi.importActual('../../../../package.json'),
    version: '0.0.0'
  };
});

describe('MainScreen', () => {
  let store;
  let twitchApi;
  beforeEach(() => {
    store = getStoreWithState();
    twitchApi = {
      userInfo: {
        id: '473294395',
        login: 'dcpesses',
        display_name: 'dcpesses',
        type: '',
        broadcaster_type: '',
        description: 'Don\'t mind me, I\'m just here for the Jackbox games and to support my peeps. ',
        profile_image_url: 'profile_image-300x300.png',
        offline_image_url: '',
        view_count: 0,
        created_at: '2019-11-18T10:47:34Z'
      },
      debug: true
    };
  });
  test('Should render without error', () => {
    const {container} = render(
      <Provider store={store}>
        <MainScreen twitchApi={twitchApi} />
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });
});
