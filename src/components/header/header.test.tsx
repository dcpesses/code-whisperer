import {render} from '@testing-library/react';
import Header from './index';

describe('Header', () => {
  test('Should render as expected', () => {
    const {container} = render(<Header />);
    expect(container).toMatchSnapshot();
  });
});
