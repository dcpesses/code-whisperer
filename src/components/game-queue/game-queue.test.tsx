import {render} from '@testing-library/react';
import GameCodeForm from './index';

describe('GameCodeForm', () => {
  test('Should render as expected', () => {
    const {container} = render(<GameCodeForm />);
    expect(container).toMatchSnapshot();
  });
});
