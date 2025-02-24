import {render, screen, fireEvent} from '@testing-library/react';
import GameCodeForm from './index';

describe('GameCodeForm', () => {
  test('Should render as expected', () => {
    const {container} = render(<GameCodeForm />);

    expect(container).toMatchSnapshot();
  });

  test('Should render and handle focus/input change/click events when enabled', () => {

    const onInputChange = vi.fn();
    const onSendToAll = vi.fn();

    render(<GameCodeForm disabled={false} onInputChange={onInputChange} onSendToAll={onSendToAll} />);

    const mockFocusEvent = {target: {select: vi.fn()}};
    const mockChangeEvent = {target: {value: 'E'}};

    const inputRoomCode = screen.getByPlaceholderText('ENTER ROOM CODE');
    const btnSendToQueue = screen.getByRole('button');

    fireEvent.focus(inputRoomCode, mockFocusEvent);
    fireEvent.change(inputRoomCode, mockChangeEvent);
    fireEvent.click(btnSendToQueue);

    expect(mockFocusEvent.target.select).toHaveBeenCalledTimes(1);
    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(onSendToAll).toHaveBeenCalledTimes(1);
  });

  test('should not handle click events when disabled', () => {
    const onSendToAll = vi.fn();

    const {rerender} = render(<GameCodeForm disabled={false} onSendToAll={onSendToAll} />);

    const mockFocusEvent = {target: {select: vi.fn()}};
    const mockChangeEvent = {target: {value: 'E'}};
    const inputRoomCode = screen.getByPlaceholderText('ENTER ROOM CODE');
    const btnSendToQueue = screen.getByRole('button');

    fireEvent.focus(inputRoomCode, mockFocusEvent);
    fireEvent.change(inputRoomCode, mockChangeEvent);
    fireEvent.click(btnSendToQueue);

    rerender(<GameCodeForm disabled={false} onSendToAll={onSendToAll} />);

    expect(onSendToAll).toHaveBeenCalledTimes(1);
  });
  test('should handle events using defaults', () => {
    render(<GameCodeForm disabled={false} />);

    const mockFocusEvent = {target: {select: vi.fn()}};
    const mockChangeEvent = {target: {value: 'E'}};
    const inputRoomCode = screen.getByPlaceholderText('ENTER ROOM CODE');
    const btnSendToQueue = screen.getByRole('button');

    fireEvent.focus(inputRoomCode, mockFocusEvent);
    fireEvent.change(inputRoomCode, mockChangeEvent);
    fireEvent.click(btnSendToQueue);
  });
});
