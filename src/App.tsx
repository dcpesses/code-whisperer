import { Link, Routes, Route } from 'react-router-dom';
import Demo from '@/pages/demo';
import logo from '@/assets/logo.svg';

import '@/App.css';

declare global {
  interface Window {
    lastUpdated: string;
  }
}

const Home = () => (
  <header className="App-header">
    <img src={logo} className="App-logo" alt="logo" />
    <p>
      <span className="h2">Hello Vite + React!</span>
    </p>
    <p>
      Edit <code>App.tsx</code> and save to test HMR updates.
    </p>
    <p>
      <span className="h1">
        <Link className="App-link" to="/demo">
          View Demos
        </Link>
      </span>
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
    <p className="last-updated">
      <small>
        { window.lastUpdated }
      </small>
    </p>
  </header>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
    </Routes>
  );
}

export default App;
