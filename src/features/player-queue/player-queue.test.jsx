/* eslint-env jest */
import {vi} from 'vitest';
import { render } from '@testing-library/react';
// import { fireEvent, render, screen } from '@testing-library/react';
// import * as fakeStates from '@/components/twitch-wheel/example-states';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import TwitchApi from '@/api/twitch';
import PlayerQueue, {PlayerQueue as PlayerQueueComponent} from './index';

vi.mock('@/api/twitch');

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
  queue: {
    interested: [
      {username: 'player4'},
      {username: 'player5', isPrioritySeat: true}
    ],
    playing: [
      {username: 'player1', isPrioritySeat: true},
      {username: 'player2', isPrioritySeat: true},
      {username: 'player3', isPrioritySeat: false},
      {username: 'player6', isPrioritySeat: false},
      {username: 'player7', isPrioritySeat: false},
      {username: 'player8'},
      {username: 'player9'}
    ],
    joined: [],
    maxPlayers: 8,
    roomCode: null,
    streamerSeat: false,
    isQueueOpen: true,
    randCount: 0,
    signupMessage: null
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


describe('PlayerQueue', () => {
  const propsBlather = {
    game: {
      name: 'Blather \'Round',
      longName: 'Blather \'Round (Party Pack 7)',
      partyPack: 'Party Pack 7',
      'Min players': 2,
      'Max players': 6,
      Variants: [
        'blather',
        'blather round',
        'blather \'round',
        'blatherround',
        'blatheround'
      ],
      override: true
    },
    userLookup: {}
  };
  const propsTMP2 = {
    game: {
      name: 'Trivia Murder Party 2',
      longName: 'Trivia Murder Party 2 (Party Pack 6)',
      partyPack: 'Party Pack 6',
      'Min players': 1,
      'Max players': 8,
      Variants: [
        'tmp2',
        'tmp 2',
        'trivia murder party 2'
      ],
      username: 'dcpesses',
      time: 1627401634507,
      locked: false,
      chosen: false,
      override: false
    },
    userLookup: {},
  };
  let state = {
    interested: [
      {username: 'player4'},
      {username: 'player5', isPrioritySeat: true}
    ],
    playing: [
      {username: 'player1', isPrioritySeat: true},
      {username: 'player2', isPrioritySeat: true},
      {username: 'player3', isPrioritySeat: false},
      {username: 'player6', isPrioritySeat: false},
      {username: 'player7', isPrioritySeat: false},
      {username: 'player8'},
      {username: 'player9'}
    ],
    joined: [],
    streamerSeat: false,
    isQueueOpen: true,
    columnWidth: 524
  };
  beforeEach(()=>{
    state = {
      interested: [
        {username: 'player4'},
        {username: 'player5', isPrioritySeat: true}
      ],
      playing: [
        {username: 'player1', isPrioritySeat: true},
        {username: 'player2', isPrioritySeat: true},
        {username: 'player3', isPrioritySeat: false},
        {username: 'player6', isPrioritySeat: false},
        {username: 'player7', isPrioritySeat: false},
        {username: 'player8'},
        {username: 'player9'}
      ],
      joined: [],
      streamerSeat: false,
      isQueueOpen: true,
      columnWidth: 524
    };
  });

  describe('handleNewPlayerRequest', () => {
    const component = new PlayerQueueComponent({updateColumnForUser: vi.fn()});

    vi.spyOn(component, 'setState').mockImplementation(()=>{});
    vi.spyOn(component, 'removeUser').mockImplementation(()=>{});

    beforeEach(() => {
      component.state = {
        ...state,
        maxPlayers: 8,
        interested: [
          {username: 'player4'},
          {username: 'player5', isPrioritySeat: true}
        ],
        playing: [
          {username: 'player1', isPrioritySeat: true},
          {username: 'player2', isPrioritySeat: false},
          {username: 'player3'},
          {username: 'player9'}
        ],
        joined: [
          // {username: 'player9'}
        ],
      };
      vi.resetAllMocks();
    });

    test('should return the expected message when successful', () => {
      component.state.isQueueOpen = true;
      expect(component.handleNewPlayerRequest('player9', {})).toBe(
        'you are already in the lobby.'
      );
      expect(component.handleNewPlayerRequest('player10', {})).toBe(
        'you have successfully joined the lobby.'
      );
      expect(component.handleNewPlayerRequest('player11', {isPrioritySeat: true})).toBe(
        'you have been successfully added to the lobby.'
      );
      component.state.isQueueOpen = false;
      expect(component.handleNewPlayerRequest('player10', {})).toBe(
        'the queue is currently closed; users have already been selected for this game.'
      );
      expect(component.handleNewPlayerRequest('player11', {isPrioritySeat: true})).toBe(
        'you have been successfully added to the lobby.'
      );

      expect(component.removeUser).toHaveBeenCalledTimes(3);
      expect(component.setState).toHaveBeenCalledTimes(3);
      expect(component.setState.mock.calls[1][0](component.state)).toEqual({
        ...component.state,
        playing: [
          ...component.state.playing,
          {username: 'player11', isPrioritySeat: true}
        ]
      });
    });
    test('should return the expected message when an error occurs', () => {
      component.state.playing = null;
      component.state.interested = null;
      component.state.isQueueOpen = true;

      // expect(component.handleNewPlayerRequest('player9', {})).toBe(
      //   'you are already in the lobby.'
      // );
      expect(component.handleNewPlayerRequest('player10', {isPrioritySeat: true})).toBe(
        'there was an error adding you to the lobby.'
      );
      // component.state.isQueueOpen = false;
      expect(component.handleNewPlayerRequest('player11', {})).toBe(
        'there was an error adding you to the lobby.'
      );


      expect(component.removeUser).toHaveBeenCalledTimes(0);
      expect(component.setState).toHaveBeenCalledTimes(0);

    });
  });

  describe('removeUser', () => {
    test('should call setState', () => {
      const component = new PlayerQueueComponent({removeUser: vi.fn()});
      vi.spyOn(component, 'setState').mockImplementation(()=>{});
      component.state = {
        ...state,
        interested: [
          {username: 'CrunchyButtMD'},
          {username: 'HyalineRose'}
        ],
        playing: [
          {username: 'Iniquity_Stepbro'},
          {username: 'HiddenPudding'}
        ],
        joined: [
          {username: 'Aurora88877'}
        ]
      };
      component.removeUser('HyalineRose');
      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls[0][0](component.state)).toEqual({
        ...component.state,
        interested: [
          {username: 'CrunchyButtMD'}
        ]
      });
    });
  });

  describe('clearQueue', () => {
    test('should clear the users from state', () => {
      const component = new PlayerQueueComponent({clearQueue: vi.fn()});
      component.state = state;
      vi.spyOn(component, 'setState').mockImplementation(()=>{});

      component.clearQueue();

      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls[0][0](component.state)).toEqual({
        ...component.state,
        interested: [],
        playing: [],
        joined: []
      });
    });
  });

  describe('openQueue', () => {
    test('should set an open queue state', () => {
      const component = new PlayerQueueComponent({openQueue: vi.fn()});
      component.state = state;
      vi.spyOn(component, 'setState').mockImplementation(()=>{});

      component.openQueue();

      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls[0][0](component.state)).toEqual({
        ...component.state,
        isQueueOpen: true
      });
    });
  });

  describe('closeQueue', () => {
    test('should set a closed queue state', () => {
      const component = new PlayerQueueComponent({closeQueue: vi.fn()});
      component.state = state;
      vi.spyOn(component, 'setState').mockImplementation(()=>{});

      component.closeQueue();

      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls[0][0](component.state)).toEqual({
        ...component.state,
        isQueueOpen: false
      });
    });
  });

  describe('playerCount', () => {
    const component = new PlayerQueueComponent(propsTMP2);
    component.state = state;

    test('should return number of players that will be playing, including streamer', () => {
      component.state.streamerSeat = true;
      expect(component.playerCount()).toBe(8);
    });
    test('should return number of players that will be playing, excluding streamer', () => {
      component.state.streamerSeat = false;
      expect(component.playerCount()).toBe(7);
    });
  });

  describe('toggleStreamerSeat', () => {
    test('should toggle the streamer seat state', () => {
      const props = {
        toggleStreamerSeat: vi.fn()
      };
      const component = new PlayerQueueComponent(props);
      component.state = state;
      component.state.streamerSeat = false;
      vi.spyOn(component, 'setState').mockImplementation(()=>{});

      component.toggleStreamerSeat();

      expect(props.toggleStreamerSeat).toHaveBeenCalledTimes(1);
      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls[0][0](component.state)).toEqual({
        ...component.state,
        streamerSeat: true
      });
    });
  });

  describe('startGame', () => {
    test('should reset the state', () => {
      const component = new PlayerQueueComponent(
        Object.assign({}, propsTMP2, {
          clearQueue: vi.fn(),
          clearRoomCode: vi.fn()
        })
      );
      vi.spyOn(component, 'setState').mockImplementation(()=>{});

      component.startGame();

      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls[0][0](component.state)).toEqual({
        ...component.state,
        interested: [],
        playing: []
      });
      expect(component.props.clearQueue).toHaveBeenCalledTimes(1);
      expect(component.props.clearRoomCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('randomizePlayers', () => {
    test('should test all cases and branches', () => {
      // const mockMath = Object.create(global.Math);
      vi.spyOn(Math, 'floor')
        .mockReturnValueOnce(4)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(4)
        .mockReturnValueOnce(2);

      const component = new PlayerQueueComponent(propsBlather);
      component.state = {
        ...state,
        interested: [
          {username: 'player4'},
          {username: 'player5'},
          {username: 'player6'},
          {username: 'player7'},
          {username: 'player8'}
        ],
        playing: [
          {username: 'player1', isPrioritySeat: true},
          {username: 'player2', isPrioritySeat: true},
          {username: 'player3'}
        ],
        maxPlayers: 6
      };
      vi.spyOn(component, 'setState').mockImplementation(()=>{});

      component.randomizePlayers();

      expect(component.setState).toHaveBeenCalledTimes(1);
      expect(component.setState.mock.calls[0][0](component.state).interested.length).toBe(2);
      expect(component.setState.mock.calls[0][0](component.state).playing.length).toBe(6);
    });
  });


  describe('render', () => {
    let store;
    let mockTwitchApi;
    beforeEach(() => {
      store = getStoreWithState();
      mockTwitchApi = new TwitchApi({
        redirectUri: 'VITE_APP_REDIRECT_URI_NOENCODE',
        clientId: 'VITE_APP_TWITCH_CLIENT_ID',
        clientSecret: 'VITE_APP_TWITCH_CLIENT_SECRET',
        debug: true,
        init: true
      });
    });

    test('Should render without error', () => {
      const {container} = render(
        <Provider store={store}>
          <PlayerQueue
            twitchApi={mockTwitchApi}
          />
        </Provider>
      );
      expect(container).toMatchSnapshot();
    });

    test('Should render with fake state data', () => {
      vi.spyOn(window.location, 'hash', 'get').mockReturnValue('?fakestate=true');
      store = getStoreWithState(storeState);
      const {container} = render(
        <Provider store={store}>
          <PlayerQueue
            twitchApi={mockTwitchApi}
          />
        </Provider>
      );
      expect(container).toMatchSnapshot();
    });
  });
});