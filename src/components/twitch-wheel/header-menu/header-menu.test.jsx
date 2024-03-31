/* eslint-env jest */
import {vi} from 'vitest';
import { Provider } from 'react-redux';
import { getStoreWithState } from '@/app/store';
import { fireEvent, render, screen } from '@testing-library/react';
import HeaderMenu from './index';

vi.mock('../../../../package.json', () => {
  return {
    ...vi.importActual('../../../../package.json'),
    version: '0.0.0'
  };
});
const storeState = {
  channel: {
    user: {
      id: '1',
      login: 'twitchstreamer',
      display_name: 'TwitchStreamer',
      type: '',
      broadcaster_type: '',
      description: 'description',
      profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
      offline_image_url: '',
      view_count: 0,
      created_at: '2019-11-18T00:47:34Z'
    },
    moderators: [{
    }],
    vips:[{
    }],
  },
  modal: {
    visible: false
  },
  user: {
    info: {
      id: '0',
      login: 'twitchuser',
      display_name: 'TwitchUser',
      type: '',
      broadcaster_type: '',
      description: 'description',
      profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
      offline_image_url: '',
      view_count: 0,
      created_at: '2019-11-18T00:47:34Z'
    },
    chatters: {
      twitchuser: {
        id: '0',
        login: 'twitchuser',
        display_name: 'TwitchUser',
        type: '',
        broadcaster_type: '',
        description: 'description',
        profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
        offline_image_url: '',
        view_count: 0,
        created_at: '2019-11-18T00:47:34Z'
      }
    },
    moderatedChannels: [{
      broadcaster_id: '1',
      broadcaster_login: 'TwitchStreamer',
      broadcaster_name: 'twitchstreamer',
    }],
    whisperStatus: {
      twitchuser: {
        login: 'twitchuser',
        response: {
          msg: 'Code sent to @TwitchUser',
          status: 204
        }
      },
    }
  }
};


describe('HeaderMenu', () => {
  let store;
  let props;
  beforeEach(()=>{
    store = getStoreWithState(storeState);
    props = {
      gamesList: {
        maxPlayersList: [4, 6, 7, 8, 9, 10, 12, 16, 20],
        validGames: {
          'Any Version': {
            Quiplash: {
              'Min players': 3,
              'Max players': 8,
              Variants: [
                'quiplash',
                'quip',
                'ql'
              ]
            }
          },
        }
      },
      parentState: {
        allowGameRequests: true,
        gameSelected: {
          name: '',
          longName: '',
          partyPack: '',
          'Min players': 1,
          'Max players': 16,
          Variants: [],
          username: '',
          time: 0,
          locked: false,
          chosen: false
        },
        messages: {},
        colors: [
          '#b0a4f9',
          '#bff0ff'
        ],
        counter: 0,
        history: [
          {
            name: '',
            longName: '',
            partyPack: '',
            'Min players': 1,
            'Max players': 16,
            Variants: [],
            username: '',
            time: 0,
            locked: false,
            chosen: false
          }
        ],
        logUserMessages: true,
        nextGameIdx: 0,
        settings: {
          enableRoomCode: true,
          enableSubRequests: false,
          customDelimiter: null
        },
        showOptionsMenu: false,
        showOptionsModal: false,
        showPlayerSelect: true,
        userLookup: {
          dcpesses: {
            'badge-info': null,
            badges: {
              broadcaster: '1',
              'twitch-recap-2023': '1'
            },
            'client-nonce': 'e4a0a659463e57c0af69041b9f1d66ea',
            color: '#1E90FF',
            'display-name': 'dcpesses',
            emotes: null,
            'first-msg': false,
            flags: null,
            id: 'ec7b4abc-ad1d-4f02-8318-749056db35b3',
            mod: false,
            'returning-chatter': false,
            'room-id': '473294395',
            subscriber: false,
            'tmi-sent-ts': '1711159950484',
            turbo: false,
            'user-id': '473294395',
            'user-type': null,
            'emotes-raw': null,
            'badge-info-raw': null,
            'badges-raw': 'broadcaster/1,twitch-recap-2023/1',
            username: 'dcpesses',
            'message-type': 'chat'
          }
        }
      },
      debugItems: [
        { label: 'Load Mock Game Requests' },
        { label: 'Load Mock Game & Player Requests' },
        { label: 'Log Debug Environment' },
        { label: 'Toggle User Message Logging' }
      ],
      items: [
        { label: 'View Chat Commands' }
      ],
      settings: {
        enableModeratedChannelsOption: false,
        enableRoomCode: true,
        enableSubRequests: false,
        customDelimiter: null
      },
      showOptionsMenu: false,
      twitchApi: {
        userInfo: {
          id: '0',
          login: 'twitchuser',
          display_name: 'TwitchUser',
          type: '',
          broadcaster_type: '',
          description: 'description',
          profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/profile_image-300x300.png',
          offline_image_url: '',
          view_count: 0,
          created_at: '2019-11-18T00:47:34Z'
        },
        debug: true
      }
    };
  });
  test('Should render without error', () => {
    const {container} = render(
      <Provider store={store}>
        <HeaderMenu {...props} />
      </Provider>
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(screen.getByLabelText('Toggle navigation'));
    expect(container).toMatchSnapshot();
    fireEvent.click(screen.getByText('Settings', {selector: 'a.settings-menu'}));
    expect(container).toMatchSnapshot();
    // TODO: determine proper queries
    // fireEvent.click(screen.getByRole('button', { name: /allows host to set a room code that can be whispered to players\./i}));
    // expect(container).toMatchSnapshot();
    // fireEvent.change(screen.getByRole('textbox', {name: 'Use Custom Delimiter:'}), {target: {value: ' | '}});
    // expect(container).toMatchSnapshot();
  });

  test('Should render with moderated channels menu', () => {
    props.settings.enableModeratedChannelsOption = true;
    const {container} = render(
      <Provider store={store}>
        <HeaderMenu {...props} />
      </Provider>
    );
    expect(container).toMatchSnapshot();
    fireEvent.click(screen.getByLabelText('Toggle navigation'));
    expect(container).toMatchSnapshot();
    fireEvent.click(screen.getByText('Settings', {selector: 'a.settings-menu'}));
    expect(container).toMatchSnapshot();
  });
});

