import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import counterReducer from '@/features/redux-counter/counterSlice';
import modalCommandListReducer from '@/features/modal-command-list/modalSlice';
// import twitchReducer from '../features/twitch/twitchSlice';
import channelReducer from '@/features/twitch/channel-slice.js';
import userReducer from '@/features/player-queue/user-slice.js';
import queueReducer from '@/features/player-queue/queue-slice';
import todosReducer from '@/features/todos/todosSlice';

const reducer = {
  counter: counterReducer,
  channel: channelReducer,
  modal: modalCommandListReducer,
  queue: queueReducer,
  user: userReducer,
  todos: todosReducer,
};
export const store = configureStore({ reducer });

export function getStoreWithState(preloadedState?: RootState) {
  return configureStore({ reducer, preloadedState });
}

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
