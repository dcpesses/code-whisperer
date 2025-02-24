import {vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {HashRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from '@/app/store';

import App from '@/App';

vi.mock('@/pages/landing', () => ({
  default: () => <div data-testid="LandingMock" />
}));
vi.mock('@/features/login', () => ({
  default: () => <div data-testid="LoginMock" />
}));
vi.mock('@/pages/error404', () => ({
  default: () => <div data-testid="Error404Mock" />
}));
vi.mock('@/pages/authenticated-app', () => ({
  default: () => <div data-testid="AuthenticatedAppMock" />
}));


describe('App', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: new URL(window.location.href),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: originalLocation,
    });
  });

  test('Should render AuthenticatedApp route by default', () => {
    render(
      <Provider store={store}>
        <HashRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <App />
        </HashRouter>
      </Provider>
    );

    expect(screen.getByTestId('AuthenticatedAppMock')).toBeInTheDocument();
  });
  test('Should render Landing route', () => {
    window.location.hash = '/landing';
    render(
      <Provider store={store}>
        <HashRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <App />
        </HashRouter>
      </Provider>
    );

    expect(screen.getByTestId('LandingMock')).toBeInTheDocument();
  });
  test('Should render Login route', () => {
    window.location.hash = '/login';
    render(
      <Provider store={store}>
        <HashRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <App />
        </HashRouter>
      </Provider>
    );

    expect(screen.getByTestId('LoginMock')).toBeInTheDocument();
  });
  test('Should render Error404 route', () => {
    window.location.hash = '/error';
    render(
      <Provider store={store}>
        <HashRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <App />
        </HashRouter>
      </Provider>
    );

    expect(screen.getByTestId('Error404Mock')).toBeInTheDocument();
  });
});
