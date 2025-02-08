import {render, screen, fireEvent} from '@testing-library/react';
import GameCodeForm from './index';

describe('GameCodeForm', () => {
  test('Should render as expected', () => {
    const {container} = render(<GameCodeForm />);
    expect(container).toMatchSnapshot();
  });

  test('Should render and handle focus/input change/click events when enabled', () => {
    vi.spyOn(GameCodeForm.defaultProps, 'onInputChange');
    vi.spyOn(GameCodeForm.defaultProps, 'onSendToAll');

    render(<GameCodeForm disabled={false} />);

    const mockFocusEvent = {target: {select: vi.fn()}};
    const mockChangeEvent = {target: {value: 'E'}};

    const inputRoomCode = screen.getByPlaceholderText('ENTER ROOM CODE');
    const btnSendToQueue = screen.getByRole('button');

    fireEvent.focus(inputRoomCode, mockFocusEvent);
    fireEvent.change(inputRoomCode, mockChangeEvent);
    fireEvent.click(btnSendToQueue);

    expect(mockFocusEvent.target.select).toHaveBeenCalledTimes(1);
    expect(GameCodeForm.defaultProps.onInputChange).toHaveBeenCalledTimes(1);
    expect(GameCodeForm.defaultProps.onSendToAll).toHaveBeenCalledTimes(1);
  });

  test('should not handle click events when disabled', () => {
    vi.spyOn(GameCodeForm.defaultProps, 'onSendToAll');

    render(<GameCodeForm disabled={true} />);

    const btnSendToQueue = screen.getByRole('button');

    fireEvent.click(btnSendToQueue);

    expect(GameCodeForm.defaultProps.onSendToAll).not.toBeCalled();
  });
});
