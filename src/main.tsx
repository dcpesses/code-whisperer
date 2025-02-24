// import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './app/store';
import App from '@/App';
import './index.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <HashRouter>
//         <App />
//       </HashRouter>
//     </Provider>
//   </React.StrictMode>
// );

const Main = (
  <Provider store={store}>
    <BrowserRouter
      basename="/code-whisperer"
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <App />
    </BrowserRouter>
  </Provider>
);

export default Main;

root.render(Main);
