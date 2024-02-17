import { useState } from 'react';

import styles from './Counter.module.css';

export function Counter() {
  const [count, setCount] = useState(0);
  const [incrementAmount, setIncrementAmount] = useState('2');

  const increment = () => {
    setCount(count + 1);
  };
  const decrement = () => {
    setCount(count - 1);
  };
  const incrementByAmount = (val: number) => {
    setCount(count + val);
  };

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={decrement}
        > - </button>
        <span
          className={styles.value}
          aria-label="Counter value">{count}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={increment}
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
          onClick={() => incrementByAmount(incrementValue)}
        >
          Add
        </button>
      </div>
    </div>
  );
}
