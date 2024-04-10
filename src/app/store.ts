import {configureStore, ThunkAction, Action, createListenerMiddleware} from '@reduxjs/toolkit';
import modalCommandListReducer from '@/features/modal-command-list/modalSlice';
// import twitchReducer from '../features/twitch/twitchSlice';
import channelReducer from '@/features/twitch/channel-slice.js';
import userReducer from '@/features/player-queue/user-slice.js';
import queueReducer from '@/features/player-queue/queue-slice';
import settingsReducer, { updateAppSettings } from '@/features/twitch/settings-slice';

const settingsListenerMiddleware = createListenerMiddleware();

settingsListenerMiddleware.startListening({
  actionCreator: updateAppSettings,
  effect: (action, listenerApi) => {
    window.console.log('settingsListenerMiddleware action.payload', action.payload);
    const {settings} = listenerApi.getState() as RootState;
    const mergedSettings = Object.assign({}, settings, action.payload);
    localStorage.setItem('__app_settings', JSON.stringify(mergedSettings));
  }
});

const reducer = {
  channel: channelReducer,
  modal: modalCommandListReducer,
  queue: queueReducer,
  settings: settingsReducer,
  user: userReducer,
};
export const store = configureStore({ reducer });

export function getStoreWithState(preloadedState?: RootState) {
  return configureStore({
    reducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(settingsListenerMiddleware.middleware),
  });
}

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
