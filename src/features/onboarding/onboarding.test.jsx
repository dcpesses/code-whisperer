/* eslint-env jest */
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { getStoreWithState } from '@/app/store';
import { Provider } from 'react-redux';
import OnboardingOverlay from './index';

/**
 * NOTE: Due to inconsistencies with "data-popper-*" attributes regardless of timeout delays, snapshots have been
 * split into testing the header and body separately until the issue can be properly diagnosed.
 *
 * Further reading: https://dev.to/atomiks/everything-i-know-about-positioning-poppers-tooltips-popovers-dropdowns-in-uis-3nkl
 * (see Problem 5: Hiding due to different clipping contexts)
 */

const setupStoreWithState = () => getStoreWithState({
  onboarding: {
    isOnboarding: false,
    activeStep: 0,
    maxSteps: 2,
  }
});

describe('OnboardingOverlay', () => {
  let body;
  let step1Props;
  let step2Props;
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['queueMicrotask', 'requestAnimationFrame'] });
    body = (<>Popover body text</>);
    step1Props = {
      content: (<>First Popover body</>), step: 1, btnOptions: {}
    };
    step2Props = {
      content: (<>Second Popover body</>), step: 2, btnOptions: {}
    };
  });
  afterEach(()=>{
    vi.useRealTimers();
  });
  test('Should render without popover', () => {
    const store = setupStoreWithState();
    const {container} = render(
      <Provider store={store}>
        <OnboardingOverlay content={body} step={1} btnOptions={{}}>
          Content
        </OnboardingOverlay>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('Should render with popover', async() => {
    const store = setupStoreWithState();
    store.dispatch({ type: 'onboarding/showOnboarding' });
    render(
      <Provider store={store}>
        <OnboardingOverlay content={body} step={1} btnOptions={{}}>
          Content
        </OnboardingOverlay>
      </Provider>
    );

    vi.advanceTimersByTime(500);
    const popoverElement = await screen.findByRole('tooltip');
    expect(popoverElement).toHaveTextContent('Popover body text');
    // expect(popoverElement).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Header')).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Body')).toMatchSnapshot();
  });

  test('Should render popover without text or icons', async() => {
    const store = setupStoreWithState();
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
    // expect(popoverElement).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Header')).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Body')).toMatchSnapshot();
  });

  test('Should render popover without backdrop', async() => {
    const store = setupStoreWithState();
    store.dispatch({ type: 'onboarding/showOnboarding' });
    render(
      <Provider store={store}>
        <OnboardingOverlay content={body} step={1} btnOptions={{showBackdrop: false}}>
          Content
        </OnboardingOverlay>
      </Provider>
    );

    vi.advanceTimersByTime(500);
    const popoverElement = await screen.findByRole('tooltip');
    expect(popoverElement).toHaveTextContent('Popover body text');
    expect(popoverElement).toBeDefined();
    // expect(popoverElement).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Header')).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Body')).toMatchSnapshot();
  });

  test('Should render popover and handle custom icons', async() => {
    const store = setupStoreWithState();
    store.dispatch({ type: 'onboarding/showOnboarding' });
    const icons = {
      done: (<i className="bi bi-check-circle"></i>),
      next: (<i className="bi bi-arrow-right-circle"></i>),
      prev: (<i className="bi bi-arrow-left-circle"></i>),
      step: (<i className="bi bi-bookmark-star text-body-secondary"></i>),
    };
    render(
      <Provider store={store}>
        <OnboardingOverlay content={body} step={1} btnOptions={{icons}}>
          Content
        </OnboardingOverlay>
      </Provider>
    );

    vi.advanceTimersByTime(500);
    const popoverElement = await screen.findByRole('tooltip');
    expect(popoverElement).toHaveTextContent('Popover body text');
    // expect(popoverElement).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Header')).toMatchSnapshot();
    expect(screen.getByTestId('Popover.Body')).toMatchSnapshot();
  });

  test('Should render with popover and display sequentially', async() => {
    let tooltipEl;
    let bodyChildren;
    const store = setupStoreWithState();
    store.dispatch({ type: 'onboarding/showOnboarding' });
    const {baseElement, rerender} = render(
      <Provider store={store} data-testid="root">
        <main data-testid="wrapper">
          <OnboardingOverlay {...step1Props}>Content 1</OnboardingOverlay>
          <OnboardingOverlay {...step2Props}>Content 2</OnboardingOverlay>
        </main>
      </Provider>
    );
    tooltipEl = await screen.findByRole('tooltip');

    vi.advanceTimersByTime(500);
    await screen.findByText('First Popover body');
    vi.advanceTimersByTime(500);
    tooltipEl = await screen.findByRole('tooltip');
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('initial render');

    // eslint-disable-next-line testing-library/no-node-access
    bodyChildren = baseElement.querySelectorAll('body>div');
    expect(bodyChildren.length).toBe(3);

    vi.advanceTimersByTime(500);
    const nextBtn = await screen.findByText('Next');
    await userEvent.click(nextBtn);
    rerender(
      <Provider store={store}>
        <div>
          <OnboardingOverlay {...step1Props}>Content 1</OnboardingOverlay>
          <OnboardingOverlay {...step2Props}>Content 2</OnboardingOverlay>
        </div>
      </Provider>
    );
    await screen.findByText('Second Popover body');
    vi.advanceTimersByTime(500);
    tooltipEl = await screen.findByRole('tooltip');
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Next btn pressed');

    vi.advanceTimersByTime(500);
    const doneBtn = await screen.findByText('Done');
    fireEvent.click(doneBtn);
    vi.advanceTimersByTime(500);
    rerender(
      <Provider store={store}>
        <div>
          <OnboardingOverlay {...step1Props}>Content 1</OnboardingOverlay>
          <OnboardingOverlay {...step2Props}>Content 2</OnboardingOverlay>
        </div>
      </Provider>
    );
    tooltipEl = await screen.findByRole('tooltip');
    expect(tooltipEl).toMatchSnapshot('Done btn pressed');
    // TODO: determine inconsistency
    // expect(screen.queryByText('Second Popover body')).toBeNull();

    // eslint-disable-next-line testing-library/no-node-access
    bodyChildren = baseElement.querySelectorAll('body>div');
    expect(bodyChildren.length).toBe(1);
  });

  test('Should render with popover and go back to previous popover', async() => {
    const store = setupStoreWithState();
    store.dispatch({ type: 'onboarding/showOnboarding' });
    store.dispatch({ type: 'onboarding/showNextStep' });
    render(
      <Provider store={store}>
        <div>
          <OnboardingOverlay {...step1Props}>Content 1</OnboardingOverlay>
          <OnboardingOverlay {...step2Props}>Content 2</OnboardingOverlay>
        </div>
      </Provider>
    );

    vi.advanceTimersByTime(500);
    await screen.findByText('Second Popover body');
    // expect(screen.getByRole('tooltip')).toMatchSnapshot('initial render');
    await screen.findByRole('tooltip');
    expect(screen.getByTestId('Popover.Header')).toMatchSnapshot('initial header render');
    expect(screen.getByTestId('Popover.Body')).toMatchSnapshot('initial body render');

    vi.advanceTimersByTime(500);
    fireEvent.click(await screen.findByText('Back'));
    await screen.findByText('First Popover body');
    expect(await screen.findByRole('tooltip')).toMatchSnapshot('Back btn pressed');
  });

  test('Should render with popover and skip over additional popovers', async() => {
    const store = getStoreWithState({
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
          <OnboardingOverlay {...step1Props}>Content 1</OnboardingOverlay>
          <OnboardingOverlay {...step2Props}>Content 2</OnboardingOverlay>
        </div>
      </Provider>
    );

    vi.advanceTimersByTime(500);
    await screen.findByText('First Popover body');
    // expect(screen.getByRole('tooltip')).toMatchSnapshot('initial render');
    await screen.findByRole('tooltip');
    expect(screen.getByTestId('Popover.Header')).toMatchSnapshot('initial header render');
    expect(screen.getByTestId('Popover.Body')).toMatchSnapshot('initial body render');

    vi.advanceTimersByTime(500);
    await userEvent.click(await screen.findByTitle('Skip and Close'));
    expect(screen.queryByText('First Popover body')).toBeNull();
  });

});

