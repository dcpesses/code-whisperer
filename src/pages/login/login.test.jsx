/* eslint-env jest */
import {render} from '@testing-library/react';
import Login from './index';
import React from 'react';

describe('Login', () => {
  describe('render', () => {
    test('Should render as expected', () => {
      const {container} = render(
        <Login />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
