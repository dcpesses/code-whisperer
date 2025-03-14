import {render, screen} from '@testing-library/react';
import Contact from './index';
import {UserEvent, userEvent} from '@testing-library/user-event';
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

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    get: function() {
      return userAgent; // customized user agent
    },
    configurable: true
  });
};

describe('Contact', () => {
  const initialUserAgent = navigator.userAgent;
  let user: UserEvent;

  beforeEach(()=>{
    setUserAgent('Mockzilla/1.0 (X11; Mock x64) HappyDOM/0.0.0');
    user = userEvent.setup();
  });

  afterEach(()=>{
    setUserAgent(initialUserAgent);
  });
  test('Should render Contact page using default props', async() => {
    render(<Contact />);

    expect(screen.getByText('Contact Us')).toBeTruthy();

    const btnSubmit = screen.getByRole('button', { name: 'Submit' });

    await user.click(btnSubmit);

    expect(screen.getByTestId('contact')).toBeDefined();
    expect(screen.getByTestId('contact')).toMatchSnapshot();
  });
});
