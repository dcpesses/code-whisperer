/* eslint-env jest */
// import {vi} from 'vitest';
import { fireEvent, /*prettyDOM,*/ render, screen } from '@testing-library/react';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import OnboardingOverlay from './index';


describe('OnboardingOverlay', () => {
  let body;

  let store;
  beforeEach(() => {
    store = getStoreWithState({
      onboarding: {
        isOnboarding: false,
        activeStep: 0,
        maxSteps: 2,
      }
    });
    body = (<>Popover body text</>);
  });
  test('Should render without popover', () => {
    const {container} = render(
      <Provider store={store}>
        <OnboardingOverlay body={body} step={1}>
          Content
        </OnboardingOverlay>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('Should render with popover', async() => {
    store.dispatch({ type: 'onboarding/showOnboarding' });
    render(
      <Provider store={store}>
        <OnboardingOverlay body={body} step={1}>
          Content
        </OnboardingOverlay>
      </Provider>
    );
    const popoverElement = await screen.findByRole('tooltip');
    expect(popoverElement).toHaveTextContent('Popover body text');
    expect(popoverElement).toMatchSnapshot();
  });

  test('Should render with popover and display sequentially', async() => {
    store.dispatch({ type: 'onboarding/showOnboarding' });
    render(
      <Provider store={store}>
        <div>
          <OnboardingOverlay body={(<>First Popover body</>)} step={1}>
            Content
          </OnboardingOverlay>
          <OnboardingOverlay body={(<>Second Popover body</>)} step={2}>
            Content
          </OnboardingOverlay>
        </div>
      </Provider>
    );
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('initial render');

    fireEvent.click(await screen.findByText('Next >'));
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Next btn pressed');

    fireEvent.click(await screen.findByText('Done >'));
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Done btn pressed');
  });

  test('Should render with popover and go back to previous popover', async() => {
    store.dispatch({ type: 'onboarding/showOnboarding' });
    store.dispatch({ type: 'onboarding/showNextStep' });
    render(
      <Provider store={store}>
        <div>
          <OnboardingOverlay body={(<>First Popover body</>)} step={1}>
            Content
          </OnboardingOverlay>
          <OnboardingOverlay body={(<>Second Popover body</>)} step={2}>
            Content
          </OnboardingOverlay>
        </div>
      </Provider>
    );
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('initial render');

    fireEvent.click(await screen.findByText('< Back'));
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Back btn pressed');
  });
  test('Should render with popover and skip over additional popovers', async() => {
    store = getStoreWithState({
      onboarding: {
        isOnboarding: false,
        activeStep: 0,
        maxSteps: 2,
      }
    });
    store.dispatch({ type: 'onboarding/showOnboarding' });
    render(
      <Provider store={store}>
        <div>
          <OnboardingOverlay body={(<>First Popover body</>)} step={1}>
            Content
          </OnboardingOverlay>
          <OnboardingOverlay body={(<>Second Popover body</>)} step={2}>
            Content
          </OnboardingOverlay>
        </div>
      </Provider>
    );
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('initial render');

    fireEvent.click(await screen.findByTitle('Skip and Close'));
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Skip btn pressed');
  });

});

