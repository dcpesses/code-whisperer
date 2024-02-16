import './App.css';
import {Counter} from './features/state-counter/Counter';
import {ReduxCounter} from './features/redux-counter/ReduxCounter';

import logo from '@/assets/logo.svg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <div className="container">
          <div className="col50">
            <h3 className="App-subheader">Redux Counter Example</h3>
            <ReduxCounter />
          </div>
          <div className="col50">
            <h3 className="App-subheader">State Counter Example</h3>
            <Counter />
          </div>
        </div>

        <div>

        </div>
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
    </div>
  );
}

export default App;
