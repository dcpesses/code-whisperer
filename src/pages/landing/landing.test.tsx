import {render} from '@testing-library/react';
import Landing from './index';

vi.mock('../../../package.json', () => {
  return {
    ...vi.importActual('../../../package.json'),
    version: '0.0.0'
  };
});

describe('Landing', () => {
  test('Should render as expected', () => {
    const {container} = render(<Landing />);
    expect(container).toMatchSnapshot();
  });
});
