import {render, screen} from '@testing-library/react';
import Contact from './index';
import {userEvent} from '@testing-library/user-event';
// import * as ContactForm from '@/components/contact-form';

interface LinkProps {
  className: string,
  to: string,
  children: React.ReactNode
}

global.fetch = vi.fn();

vi.mock('react-router-dom', () => {
  const reactRouterDom = vi.importActual('react-router-dom');
  return {
    ...reactRouterDom,
    Link: ({className, to, children}: LinkProps) => (
      <div className={className} data-to={to}>
        {children}
      </div>
    )
  };
});

describe('Contact', () => {
  test('Should render Contact page using default props', async() => {
    render(<Contact />);

    expect(screen.getByText('Contact Us')).toBeTruthy();

    const btnSubmit = screen.getByRole('button', { name: 'Submit' });

    await userEvent.click(btnSubmit);

    expect(screen.getByTestId('contact')).toBeDefined();
    expect(screen.getByTestId('contact')).toMatchSnapshot();
  });
});
