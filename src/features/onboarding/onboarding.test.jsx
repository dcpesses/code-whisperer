/* eslint-env jest */
import { fireEvent, /*prettyDOM,*/ render, screen, waitFor } from '@testing-library/react';

import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import OnboardingOverlay from './index';


describe('OnboardingOverlay', () => {
  let body;
  let btnOptions;

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
    btnOptions = {};
  });
  test('Should render without popover', () => {
    const {container} = render(
      <Provider store={store}>
        <OnboardingOverlay content={body} step={1} btnOptions={btnOptions}>
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
        <OnboardingOverlay content={body} step={1} btnOptions={btnOptions}>
          Content
        </OnboardingOverlay>
      </Provider>
    );
    const popoverElement = await screen.findByRole('tooltip');
    expect(popoverElement).toHaveTextContent('Popover body text');
    expect(popoverElement).toMatchSnapshot();
  });

  test('Should render popover without text or icons', async() => {
    store.dispatch({ type: 'onboarding/showOnboarding' });
    let btnOptionAlt = {
      showIcons: false,
      showText: false
    };
    render(
      <Provider store={store}>
        <OnboardingOverlay content={body} step={1} btnOptions={btnOptionAlt}>
          Content
        </OnboardingOverlay>
      </Provider>
    );
    await screen.findByText('❯');
    const popoverElement = await screen.findByRole('tooltip');
    expect(popoverElement).toHaveTextContent('Popover body text');
    expect(popoverElement).not.toHaveTextContent('Next');
    expect(popoverElement).toHaveTextContent('❯');
    expect(popoverElement).toMatchSnapshot();
  });

  test('Should render with popover and display sequentially', async() => {
    store.dispatch({ type: 'onboarding/showOnboarding' });
    render(
      <Provider store={store}>
        <div>
          <OnboardingOverlay content={(<>First Popover body</>)} step={1} btnOptions={btnOptions}>
            Content
          </OnboardingOverlay>
          <OnboardingOverlay content={(<>Second Popover body</>)} step={2} btnOptions={btnOptions}>
            Content
          </OnboardingOverlay>
        </div>
      </Provider>
    );
    await screen.findByText('First Popover body');
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('initial render');

    fireEvent.click(await screen.findByText('Next'));
    await screen.findByText('Second Popover body');
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Next btn pressed');

    fireEvent.click(await screen.findByText('Done'));
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Done btn pressed');
    expect(screen.queryByText('Second Popover body')).toBeNull();
  });

  test('Should render with popover and go back to previous popover', async() => {
    store.dispatch({ type: 'onboarding/showOnboarding' });
    store.dispatch({ type: 'onboarding/showNextStep' });
    render(
      <Provider store={store}>
        <div>
          <OnboardingOverlay content={(<>First Popover body</>)} step={1} btnOptions={btnOptions}>
            Content
          </OnboardingOverlay>
          <OnboardingOverlay content={(<>Second Popover body</>)} step={2} btnOptions={btnOptions}>
            Content
          </OnboardingOverlay>
        </div>
      </Provider>
    );
    await screen.findByText('Second Popover body');
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('initial render');

    fireEvent.click(await screen.findByText('Back'));
    await screen.findByText('First Popover body');
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
          <OnboardingOverlay content={(<>First Popover body</>)} step={1} btnOptions={btnOptions}>
            Content
          </OnboardingOverlay>
          <OnboardingOverlay content={(<>Second Popover body</>)} step={2} btnOptions={btnOptions}>
            Content
          </OnboardingOverlay>
        </div>
      </Provider>
    );
    await screen.findByText('First Popover body');
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('initial render');

    fireEvent.click(await screen.findByTitle('Skip and Close'));
    await waitFor(() => {
      expect(screen.queryByText('First Popover body')).toBeNull();
    });
  });

});

