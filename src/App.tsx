import { Routes, Route } from 'react-router-dom';

// Pages
import AuthenticatedApp from '@/pages/authenticated-app';
import Error404 from '@/pages/error404';
import Login from '@/features/login';
import Landing from '@/pages/landing';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/App.css';

declare global {
  interface Window {
    lastUpdated: string;
  }
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/error" element={<Error404 />} />
      <Route path="/*" element={<AuthenticatedApp />} />
    </Routes>
  );
}

export default App;
export {Error404};
