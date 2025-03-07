import {render} from '@testing-library/react';
import KofiButton from './index';

describe('KofiButton', () => {
  test('Should render as button for a link that opens in a new window', () => {
    const {container} = render(<KofiButton />);
    expect(container).toMatchSnapshot();
  });
  test('Should render as button for a link that opens in the same window', () => {
    const {container} = render(<KofiButton opensInNewWindow={false} />);
    expect(container).toMatchSnapshot();
  });
});
