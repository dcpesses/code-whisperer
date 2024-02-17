import {fireEvent, render, screen} from '@testing-library/react';

import {Counter} from './Counter';

describe('Counter', () => {
  test('Should render and display state counter value', () => {
    render(<Counter />);
    const counterElement = screen.getByLabelText('Counter value', {selector: 'span'});

    expect(counterElement).toHaveTextContent('0');
    expect(counterElement).toMatchSnapshot();
  });

  test('Should increment and display updated counter value', () => {
    render(<Counter />);
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Increment value');

    expect(counterElement()).toHaveTextContent('0');

    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('1');
  });

  test('Should decrement and display updated counter value', () => {
    render(<Counter />);
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Decrement value');

    expect(counterElement()).toHaveTextContent('0');

    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('-1');
  });

  test('Should increment counter using numeric input amount', () => {
    render(<Counter />);
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Add increment amount');

    expect(counterElement()).toHaveTextContent('0');

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('2');
    fireEvent.change(input, {target: {value: '3'}});
    expect(input).toHaveValue('3');

    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('3');

  });
  test('Should handle invalid input values', () => {
    render(<Counter />);
    const counterElement = () => screen.getByLabelText('Counter value', {selector: 'span'});
    const button = screen.getByLabelText('Add increment amount');

    expect(counterElement()).toHaveTextContent('0');

    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'f'}});
    fireEvent.click(button);

    expect(counterElement()).toHaveTextContent('0');

  });
});

