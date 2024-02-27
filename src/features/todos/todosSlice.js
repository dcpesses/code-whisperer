import { createSlice } from '@reduxjs/toolkit';

const initialState = [
  { id: 1708982768968, text: 'Hit the gym', completed: false },
  { id: 1708982943626, text: 'Meet George', completed: true }
];

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodo: (state, action) => {
      const newTodo = {
        id: Date.now(),
        text: action.payload,
        completed: false,
      };
      state.push(newTodo);
    },
    toggleComplete: (state, action) => {
      const todo = state.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      const index = state.findIndex((todo) => todo.id === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    editTodo: (state, action) => {
      const index = state.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) {
        state[index].text = action.payload.text;
      }
    }
  },
});
export const { addTodo, editTodo, toggleComplete, deleteTodo } = todoSlice.actions;
export default todoSlice.reducer;
