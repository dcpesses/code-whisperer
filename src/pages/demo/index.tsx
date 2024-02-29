import {Counter} from '@/features/state-counter/Counter';
import {ReduxCounter} from '@/features/redux-counter/ReduxCounter';

import Todo from '@/features/todos/Todos';
import {Link} from 'react-router-dom';

import './demo.css';

function Demo() {
  return (
    <div className="Demo">
      <header className="Demo-header">
        <div style={{float: 'left'}}>
          <Link className="Demo-link" to="/">
            ← Home
          </Link>
        </div>

        <div style={{float: 'right'}}>
          Edit <code>pages/demo/index.tsx</code> and save to test HMR updates.
        </div>
      </header>

      <h1>Demos & Examples</h1>

      <div className="Demo-examples">
        <div>
          <div className="Demo-example">
            <h3 className="Demo-subheader">Redux To-Dos</h3>
            <Todo />
            <div></div>
          </div>

          <div className="Demo-example">
            <h3 className="Demo-subheader">Redux Counter</h3>
            <ReduxCounter />
            <div></div>
          </div>

          <div className="Demo-example">
            <h3 className="Demo-subheader">State Counter</h3>
            <Counter />
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demo;
