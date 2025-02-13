import {render} from '@testing-library/react';
import ChatBubbles from './index';

describe('ChatBubbles', () => {
  test('Should render as expected', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.7)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.4)
      .mockReturnValue(0.5);
    const {container} = render(<ChatBubbles count={4} size={16} />);
    expect(Math.random).toBeCalledTimes(16);
    expect(container).toMatchSnapshot();
  });
});
