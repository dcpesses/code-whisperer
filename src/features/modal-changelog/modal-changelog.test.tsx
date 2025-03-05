import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import ModalChangelog from './index';

describe('ModalChangelog', () => {
  test('Should render modal', async() => {
    vi.useFakeTimers({ toFake: ['queueMicrotask', 'requestAnimationFrame'] });
    const {rerender} = render(
      <ModalChangelog
        handleClose={vi.fn()}
        show={true}
      />
    );
    const dialogElement = await screen.findByRole('dialog');
    expect(dialogElement).toHaveTextContent('What\'s New');

    const btnToggle = await screen.findByText('Toggle Past Updates');

    await userEvent.click(btnToggle);

    vi.advanceTimersByTime(1500);

    rerender(
      <ModalChangelog
        handleClose={vi.fn()}
        show={true}
      />
    );

    const pastUpdates = await screen.findByTestId('past-updates');
    expect(pastUpdates.classList.contains('show')).toBeTruthy();
    vi.useRealTimers();
  });
});
