import './App.css';
import {Counter} from './features/state-counter/Counter';
import {ReduxCounter} from './features/redux-counter/ReduxCounter';

import Todo from './features/todos/Todos';

import logo from '@/assets/logo.svg';

function App() {
  return (
    <div className="App">
      <header className="App-header">

        <p>
          <img src={logo} className="App-logo" alt="logo" />
          <span className="h2">Hello Vite + React!</span>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>

      <h1>Examples</h1>

      <div className="App-examples">
        <div>
          <div className="App-example">
            <h3 className="App-subheader">Redux To-Dos</h3>
            <Todo />
          </div>

          <div className="App-example _col50">
            <h3 className="App-subheader">Redux Counter</h3>
            <ReduxCounter />
          </div>

          <div className="App-example _col50">
            <h3 className="App-subheader">State Counter</h3>
            <Counter />
          </div>
        </div>


      </div>
    </div>
  );
}

export default App;
