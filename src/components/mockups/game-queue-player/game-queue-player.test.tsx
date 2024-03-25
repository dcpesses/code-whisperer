import {render} from '@testing-library/react';
import GameQueue from './index';

describe('GameQueue', () => {
  test('Should render as expected', () => {
    const {container} = render(<GameQueue />);
    expect(container).toMatchSnapshot();
  });
});
