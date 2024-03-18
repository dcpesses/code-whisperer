import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/app/store';

export interface ModalState {
  visible: boolean;
}

const initialState: ModalState = {
  visible: false,
};


export const modalCommandListSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    hideModalCommandList: (state) => {
      state.visible = false;
    },
    showModalCommandList: (state) => {
      state.visible = true;
    }
  },
});

export const selectModalCommandList = (state: RootState) => state.modal.visible;

export const { hideModalCommandList, showModalCommandList } = modalCommandListSlice.actions;

export default modalCommandListSlice.reducer;
