import {render} from '@testing-library/react';
import TestUserForm from './index';

describe('TestUserForm', () => {
  test('Should render as expected', () => {
    const {container} = render(<TestUserForm />);
    expect(container).toMatchSnapshot();
  });
});
