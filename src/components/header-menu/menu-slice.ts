import { createSlice } from '@reduxjs/toolkit';

export interface MenuState {
  showGames: boolean;
  showKofi: boolean;
  showOptions: boolean;
  showSettings: boolean;
}

const initialState: MenuState = {
  showGames: false,
  showKofi: false,
  showOptions: false,
  showSettings: false,
};


export const MenuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    toggleGameList: (state) => {
      state.showGames = !state.showGames;
    },
    toggleKofiOverlay: (state) => {
      state.showKofi = !state.showKofi;
    },
    toggleOptionsMenu: (state) => {
      state.showOptions = !state.showOptions;
    },
    toggleSettingsMenu: (state) => {
      state.showSettings = !state.showSettings;
    },
    updateOptionsMenu: (state, action) => {
      state.showOptions = action.payload;
    },
  },
});

export const {
  toggleGameList,
  toggleKofiOverlay,
  toggleOptionsMenu,
  toggleSettingsMenu,
  updateOptionsMenu
} = MenuSlice.actions;

export default MenuSlice.reducer;
