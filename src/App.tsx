import { Link, Routes, Route } from 'react-router-dom';
import logo from '@/assets/new-logo.svg';

// Pages
import Demo from '@/pages/demo';
import Login from '@/pages/login';

import 'bootstrap/dist/css/bootstrap.css';
import '@/App.css';

declare global {
  interface Window {
    lastUpdated: string;
  }
}

const Error404 = () => (
  <div className="error-404 full-pg d-flex w-100 h-100 my-0 mx-auto flex-column">
    <main className="px-3 text-center">
      <h1 className="display-1 ppb-4">404</h1>
      <p>
        <small className="fst-italic">
          I&apos;m sorry, Dave. I&apos;m afraid I can&apos;t do that.
        </small>
      </p>
      <div className="col-6 mx-auto">
        <Link className="btn btn-outline-primary btn-lgg mt-5" to="/">
          Go Home
        </Link>
      </div>
    </main>
  </div>
);

const Home = () => (
  <header className="App-header full-pg">
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
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}

export default App;
