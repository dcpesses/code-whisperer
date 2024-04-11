import {configureStore, ThunkAction, Action, createListenerMiddleware, Tuple} from '@reduxjs/toolkit';
import modalCommandListReducer from '@/features/modal-command-list/modalSlice';
import channelReducer from '@/features/twitch/channel-slice.js';
import userReducer from '@/features/player-queue/user-slice.js';
import queueReducer from '@/features/player-queue/queue-slice';
import settingsReducer, { updateAppSettings, updateAppSettingsListener } from '@/features/twitch/settings-slice';

const settingsListenerMiddleware = createListenerMiddleware();

settingsListenerMiddleware.startListening({
  actionCreator: updateAppSettings,
  effect: updateAppSettingsListener
});

const reducer = {
  channel: channelReducer,
  modal: modalCommandListReducer,
  queue: queueReducer,
  settings: settingsReducer,
  user: userReducer,
};

const middleware = () => new Tuple(settingsListenerMiddleware.middleware);

export const store = configureStore({
  reducer,
  middleware,
});

export function getStoreWithState(preloadedState?: RootState) {
  return configureStore({
    reducer,
    preloadedState,
    middleware,
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
