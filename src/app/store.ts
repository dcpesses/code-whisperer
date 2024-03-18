import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import counterReducer from '@/features/redux-counter/counterSlice';
import modalCommandListReducer from '@/features/modal-command-list/modalSlice';
// import twitchReducer from '../features/twitch/twitchSlice';
// import { profileReducer } from '@/features/twitch/profileSlice';
import todosReducer from '@/features/todos/todosSlice';

const reducer = {
  counter: counterReducer,
  modal: modalCommandListReducer,
  // profile: profileReducer,
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
