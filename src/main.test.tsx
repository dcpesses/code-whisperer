import { vi, test, expect } from 'vitest';
// import {createRoot} from 'react-dom/client';
import {render, screen} from '@testing-library/react';
import Main from '@/main';

const { mockRender } = vi.hoisted(() => {
  return {
    mockRender: vi.fn()
  };
});

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn().mockImplementation(() => ({
    render: mockRender,
  }))
}));

describe('Main', () => {
  test('should match the snapshot when the JSXElement is rendered as component', () => {
    const MainComponent = () => Main;

    const {container} = render(<MainComponent />);
    expect(container).toMatchSnapshot();

    const loadingElement = screen.getByText(/Loading/i);
    expect(loadingElement).toBeInTheDocument();
  });
});
