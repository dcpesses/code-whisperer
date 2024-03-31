/* eslint-env jest */
import {vi} from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import PlayerQueueCard from './player-queue-card';


describe('PlayerQueueCard', () => {
  let store;
  beforeEach(() => {
    store = getStoreWithState();
  });
  test('Should render without error', () => {
    const {container} = render(
      <Provider store={store}>
        <PlayerQueueCard />
      </Provider>
    );
    expect(container).toMatchSnapshot();
    // let button = screen.getByText('View More');
    fireEvent.click(screen.getByText('View More'));
    expect(container).toMatchSnapshot();
    // let button = screen.getByText('View Less');
    fireEvent.click(screen.getByText('View Less'));
    expect(container).toMatchSnapshot();
  });

  test('Should render as a user in the interested queue', () => {
    store = getStoreWithState({
      user: {
        chatters: {
          dcpesses: {
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
          }
        },
        whisperStatus: {}
      }
    });
    const actionHandler = vi.fn();
    const removeHandler = vi.fn();
    const {container} = render(
      <Provider store={store}>
        <PlayerQueueCard
          btnProps={{
            label: 'Add 2 Playing',
            onClick: actionHandler,
          }}
          onRemoveUser={removeHandler}
          onSendCode={null}
          queueName={'interested'}
          prioritySeat={false}
          relativeTime={null}
          showSendButton={false}
          username={'dcpesses'}
        />
      </Provider>
    );
    expect(container).toMatchSnapshot();

    const button1 = screen.getByTitle('Remove');
    fireEvent.click(button1);
    expect(removeHandler).toHaveBeenCalled();
    const button2 = screen.getByTitle('Add 2 Playing');
    fireEvent.click(button2);
    expect(actionHandler).toHaveBeenCalled();
  });

  test('Should render as a whispered user in the playing queue', () => {
    store = getStoreWithState({
      user: {
        chatters: {
          dcpesses: {
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
          }
        },
        whisperStatus: {
          dcpesses: {
            login: 'dcpesses',
            response: {
              msg: 'Error 400 sending to @dcpesses: A user cannot whisper themself',
              status: 400,
              error: {
                error: 'Bad Request',
                status: 400,
                message: 'A user cannot whisper themself',
                player: {
                  id: '473294395',
                  username: 'dcpesses'
                }
              }
            }
          }
        }
      }
    });
    const actionHandler = vi.fn();
    const removeHandler = vi.fn();
    const {container} = render(
      <Provider store={store}>
        <PlayerQueueCard
          btnProps={{
            label: 'Move 2 Interesting',
            onClick: actionHandler,
          }}
          onRemoveUser={removeHandler}
          onSendCode={null}
          queueName={'interested'}
          prioritySeat={false}
          relativeTime={null}
          showSendButton={false}
          username={'dcpesses'}
        />
      </Provider>
    );
    expect(container).toMatchSnapshot();

    const button1 = screen.getByTitle('Remove');
    fireEvent.click(button1);
    expect(removeHandler).toHaveBeenCalled();
    const button2 = screen.getByTitle('Move 2 Interesting');
    fireEvent.click(button2);
    expect(actionHandler).toHaveBeenCalled();
  });

  test('Should render with priority seat and relative time stamps', () => {
    vi.useFakeTimers();
    vi.spyOn(Date, 'now').mockReturnValue(1445470140000); // October 21, 2015 4:29:00 PM PST
    const {container} = render(
      <Provider store={store}>
        <PlayerQueueCard
          prioritySeat={true}
          relativeTime="Now"
        />
      </Provider>
    );
    expect(container).toMatchSnapshot();
    expect(screen.getByText('Now')).not.toBeNull();
    vi.useRealTimers();
  });
});

