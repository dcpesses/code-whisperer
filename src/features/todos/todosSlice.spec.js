/* eslint-env jest */
import { vi } from 'vitest';
import todosReducer, { addTodo, deleteTodo, editTodo, toggleComplete } from './todosSlice';

describe('todos reducer', () => {
  let initialState;
  let date;

  beforeEach(() => {
    initialState = [
      { id: 1708982768968, text: 'Hit the gym', completed: false },
      { id: 1708982943626, text: 'Meet George', completed: true }
    ];
    date = new Date(2022, 2, 22);

    vi.useFakeTimers();
    vi.setSystemTime(date);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('should handle initial state', () => {
    expect(todosReducer(undefined, { type: 'unknown' })).toMatchSnapshot();
  });

  test('should handle addTodo', () => {
    const actual = todosReducer(initialState, addTodo('Newly added item message'));
    expect(actual[2].text).toEqual('Newly added item message');
  });

  test('should handle deleteTodo', () => {
    const actual = todosReducer(initialState, deleteTodo(1708982768968));
    expect(actual.length).toEqual(1);
    expect(actual[0].text).toBe('Meet George');
  });

  test('should handle editTodo', () => {
    const actual = todosReducer(initialState, editTodo({id: 1708982768968, text: 'Hit the library'}));
    expect(actual[0].text).toBe('Hit the library');
  });

  test('should handle toggleComplete', () => {
    const actual = todosReducer(initialState, toggleComplete(1708982768968));
    expect(actual[0].completed).toBeTruthy();
  });
});
