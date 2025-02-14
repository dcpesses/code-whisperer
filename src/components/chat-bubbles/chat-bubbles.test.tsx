import {render} from '@testing-library/react';
import ChatBubbles from './index';

describe('ChatBubbles', () => {
  test('Should render as expected', () => {
    const {container} = render(<ChatBubbles />);
    expect(container).toMatchSnapshot();
  });
});
