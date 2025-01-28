/* eslint-disable testing-library/no-node-access */
import { vi } from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import ModalChangelog from './index';

describe('ModalChangelog', () => {
  test('Should render modal', async() => {
    render(
      <ModalChangelog
        handleClose={vi.fn()}
        show={true}
      />
    );
    const dialogElement = await screen.findByRole('dialog');
    expect(dialogElement).toHaveTextContent('What\'s New');

    fireEvent.click(await screen.findByText('Toggle Past Updates'));
    const pastUpdates = await screen.findByTestId('past-updates');
    expect(pastUpdates.classList.contains('show')).toBeTruthy();
  });
});
