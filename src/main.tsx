// import React from 'react';
import {createRoot} from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
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
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
);

export default Main;

root.render(Main);
