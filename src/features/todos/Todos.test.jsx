/* eslint-env jest */
// import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { getStoreWithState } from '../../app/store';
import { Provider } from 'react-redux';
import Todos from './Todos';

describe('Todos', () => {
  let store;
  beforeEach(() => {
    store = getStoreWithState();
  });
  test('Should render as expected', () => {
    const {container} = render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );

    expect(container).toMatchSnapshot();
  });

  test('Should add and display new todo list item', () => {
    render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    const forminput = screen.getByPlaceholderText('Enter a Todo...', {selector: 'input'});
    const button = screen.getByText('Add Todo');

    expect(forminput).toHaveTextContent('');
    fireEvent.change(forminput, {target: {value: 'Howdy Doody'}});
    fireEvent.click(button);

    const listitem = () => screen.getByText('Howdy Doody', {selector: 'span'});
    expect(listitem).toBeDefined();
  });

  test('Should edit and update a todo list item', () => {
    render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    const editbutton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editbutton);

    const forminput = screen.getByPlaceholderText('Edit Todo', {selector: 'input'});
    expect(forminput.value).toBe(store.getState().todos[0].text);

    fireEvent.change(forminput, {target: {value: 'Howdy Doody'}});
    const updatebutton = screen.getByText('Edit', {selector: 'button'});
    fireEvent.click(updatebutton);

    const listitem = screen.queryByText('Howdy Doody', {selector: 'span'});
    expect(listitem).toBeDefined();
  });

  test('Should edit and cancel updating a todo list item', () => {
    render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    const editbutton = screen.getAllByTitle('Edit')[0];
    fireEvent.click(editbutton);

    const forminput = screen.getByPlaceholderText('Edit Todo', {selector: 'input'});
    expect(forminput.value).toBe(store.getState().todos[0].text);

    fireEvent.change(forminput, {target: {value: 'Howdy Doody'}});
    const updatebutton = screen.getByText('Cancel', {selector: 'button'});
    fireEvent.click(updatebutton);

    const listitem = screen.queryByText('Howdy Doody', {selector: 'span'});
    expect(listitem).toBeNull();
  });

  test('Should delete a todo list item', () => {
    render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    const todoItemText = store.getState().todos[0].text;
    expect(screen.getByText(todoItemText, {selector: 'span'})).toBeDefined();

    const deletebutton = screen.getAllByTitle('Delete')[0];
    fireEvent.click(deletebutton);

    expect(screen.queryByText(todoItemText, {selector: 'span'})).toBeNull();
  });

  test('Should mark a todo list item as completed', () => {
    render(
      <Provider store={store}>
        <Todos />
      </Provider>
    );
    const todoItemText = store.getState().todos[0].text;
    const listitemContent = screen.queryByText(todoItemText, {selector: 'span'});
    expect(listitemContent.style.textDecoration).toBe('none');

    const checkbox = screen.getByTitle('Mark Complete', {selector: 'input'});
    fireEvent.click(checkbox);

    expect(listitemContent.style.textDecoration).toBe('line-through');
  });
});

