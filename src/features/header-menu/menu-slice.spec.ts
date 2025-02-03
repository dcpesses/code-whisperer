import menuReducer, {
  MenuState,
  toggleGameList,
  toggleKofiOverlay,
  toggleOptionsMenu,
  toggleSettingsMenu,
  updateOptionsMenu
} from './menu-slice';

describe('menu reducer', () => {
  const initialState: MenuState = {
    showGames: false,
    showKofi: false,
    showOptions: false,
    showSettings: false,
  };
  it('should handle initial state', () => {
    expect(menuReducer(undefined, { type: 'unknown' })).toEqual({
      showKofi: false,
      showGames: false,
      showOptions: false,
      showSettings: false,
    });
  });

  it('should set showGames to true', () => {
    const actual = menuReducer(initialState, toggleGameList());
    expect(actual.showGames).toBeTruthy();
  });

  it('should set showKofi to true', () => {
    const actual = menuReducer(initialState, toggleKofiOverlay());
    expect(actual.showKofi).toBeTruthy();
  });

  it('should set showOptions to true', () => {
    const actual = menuReducer(initialState, toggleOptionsMenu());
    expect(actual.showOptions).toBeTruthy();
  });

  it('should set showSettings to true', () => {
    const actual = menuReducer(initialState, toggleSettingsMenu());
    expect(actual.showSettings).toBeTruthy();
  });

  it('should update showOptions with the payload value', () => {
    let actual = menuReducer(initialState, updateOptionsMenu(true));
    expect(actual.showOptions).toBeTruthy();
    actual = menuReducer(actual, updateOptionsMenu(false));
    expect(actual.showOptions).toBeFalsy();
  });
});
