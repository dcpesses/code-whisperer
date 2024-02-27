import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo, editTodo, toggleComplete, deleteTodo } from './todosSlice';

import './todos.css';

const Todos = () => {
  const [text, setText] = useState('');
  const todos = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  const [editId, setEditId] = useState('');
  const [isEditing, setEditing] = useState(false);

  const createTodoListItem = ({id, completed, text}) => (
    <li className="todo-list-item" key={id}>
      <span className="item-checkbox">
        <input type="checkbox" checked={completed} onChange={() => handleToggleComplete(id)} title={completedTodoText(completed)} />
      </span>
      <span className="item-content" style={{textDecoration: completedTodoStyle(completed)}}>
        {text}
      </span>
      <span className="item-actions">
        <button className="item-actions-edit" onClick={()=>onEditToggle(id, text)} title="Edit">
          ✎
        </button>
        <button className="item-actions-delete" onClick={() => handleDeleteTodo(id)} title="Delete">
          ✖
        </button>
      </span>
    </li>
  );

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleAddTodo = () => {
    if (text) {
      dispatch(addTodo(text));
      setText('');
    }
  };

  const onEditToggle = ( id, content ) => {
    setEditing(true);
    setEditId(id);
    setText(content);
  };

  const handleEditTodo = () => {
    if (text) {
      dispatch(editTodo({id: editId, text}));
      setText('');
      setEditing(false);
    }
  };
  const handleEditCancel = () => {
    setText('');
    setEditing(false);
  };

  const handleToggleComplete = (id) => {
    dispatch(toggleComplete(id));
  };

  const handleDeleteTodo = (id) => {
    dispatch(deleteTodo(id));
  };

  const completedTodoStyle = (completed) => completed ? 'line-through' : 'none';
  const completedTodoText = (completed) => completed ? 'Mark Incomplete' : 'Mark Complete';

  return (
    <div className="todos">
      {
        isEditing ?
          <div className="add-todo">
            <input type="text" value={text} onChange={handleInputChange} placeholder="Edit Todo" />
            <button onClick={handleEditTodo}>
              Edit
            </button>
            <button onClick={handleEditCancel}>
              Cancel
            </button>
          </div>
          :
          <div className="add-todo">
            <input type="text" value={text} onChange={handleInputChange} placeholder="Enter a Todo..." />
            <button onClick={handleAddTodo}>
              Add Todo
            </button>
          </div>
      }

      <ul className={isEditing ? 'todos-list editing' : 'todos-list'}>
        {todos.map(createTodoListItem)}
      </ul>
    </div>
  );
};

export default Todos;
