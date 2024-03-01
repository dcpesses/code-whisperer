import { Link, Routes, Route } from 'react-router-dom';
import Demo from '@/pages/demo';
import logo from '@/assets/new-logo.svg';

import '@/App.css';

declare global {
  interface Window {
    lastUpdated: string;
  }
}

const Home = () => (
  <header className="App-header">
    <Link className="App-link" to="/demo">
      <img src={logo} className="App-logo" alt="logo" />
    </Link>
    <p>
      <span className="h1">Game Code Whisperer</span>
    </p>
    <p>
      <span className="h3">
        Coming Soon
      </span>
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
