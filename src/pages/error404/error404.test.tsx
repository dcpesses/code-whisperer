import {render} from '@testing-library/react';
import Error404 from './index';

interface LinkProps {
  className: string,
  to: string,
  children: React.ReactNode
}

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

describe('Error404', () => {
  test('Should render as expected', () => {
    const {container} = render(<Error404 />);
    expect(container).toMatchSnapshot();
  });
});
