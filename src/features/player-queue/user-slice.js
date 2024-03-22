import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  info: {},
};


export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setUserInfo: (state, action) => {
      if (action.payload.login) {
        state.info[action.payload.login] = action.payload;
      }
    },
  },
});

export const selectUser = (state) => state.users.info;

export const { setUserInfo } = userSlice.actions;

export default userSlice.reducer;
