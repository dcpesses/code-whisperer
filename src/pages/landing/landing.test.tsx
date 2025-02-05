import {render} from '@testing-library/react';
import Landing from './index';

describe.skip('Landing', () => {
  test('Should render as expected', () => {
    const {container} = render(<Landing />);
    expect(container).toMatchSnapshot();
  });
});
