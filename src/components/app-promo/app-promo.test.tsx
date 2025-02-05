import {render} from '@testing-library/react';
import AppPromo from './index';

describe('AppPromo', () => {
  test('Should render as expected', () => {
    const {container} = render(<AppPromo />);
    expect(container).toMatchSnapshot();
  });
});
