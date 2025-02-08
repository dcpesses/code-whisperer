import {render} from '@testing-library/react';
import LandingWave from './index';

describe('LandingWave', () => {
  test('Should render as expected', () => {
    const {container} = render(<LandingWave />);
    expect(container).toMatchSnapshot();
  });
});
