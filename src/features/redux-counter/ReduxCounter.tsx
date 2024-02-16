import { useState } from 'react';

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  incrementIfOdd,
  selectCount,
} from './counterSlice';
import styles from './ReduxCounter.module.css';

export function ReduxCounter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        > - </button>
        <span
          className={styles.value}
          aria-label="Counter value">{count}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        > + </button>
      </div>
      <div className={styles.row}>
        <input className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
        />
        <button className={styles.button}
          aria-label="Add increment amount"
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          Add
        </button>
        <div>
          <button
            className={styles.asyncButton}
            aria-label="Add async increment amount"
            onClick={() => dispatch(incrementAsync(incrementValue))}
          >
            Add Async
          </button>
          <button
            className={styles.button}
            aria-label="Add increment amount if odd"
            onClick={() => dispatch(incrementIfOdd(incrementValue))}
          >
            Add If Odd
          </button>
        </div>

      </div>
    </div>
  );
}
