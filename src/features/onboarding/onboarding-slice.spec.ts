import onboardingReducer, {
  OnboardingState,
  showNextStep,
  hideOnboarding,
  showOnboarding,
  showPrevStep,
  updateMaxSteps
} from './onboarding-slice';

describe('onboarding reducer', () => {
  const initialState: OnboardingState = {
    isOnboarding: false,
    activeStep: 2,
    maxSteps: 3,
  };
  it('should handle initial state', () => {
    expect(onboardingReducer(undefined, { type: 'unknown' })).toEqual({
      isOnboarding: false,
      activeStep: 0,
      maxSteps: 3,
    });
  });

  it('should set isOnboarding to false and activeStep to 0', () => {
    const actual = onboardingReducer(initialState, hideOnboarding());
    expect(actual.isOnboarding).toBeFalsy();
    expect(actual.activeStep).toEqual(0);
  });

  it('should set isOnboarding to true and activeStep to 1', () => {
    const actual = onboardingReducer(initialState, showOnboarding());
    expect(actual.isOnboarding).toBeTruthy();
    expect(actual.activeStep).toEqual(1);
  });

  it('should increment the step value', () => {
    const actual = onboardingReducer(initialState, showNextStep());
    expect(actual.activeStep).toEqual(3);
  });

  it('should increment the step value and set isOnboarding to false', () => {
    let actual = onboardingReducer(initialState, showNextStep());
    actual = onboardingReducer(actual, showNextStep());
    expect(actual.activeStep).toEqual(4);
    expect(actual.isOnboarding).toBeFalsy();
  });

  it('should decrease the step value', () => {
    const actual = onboardingReducer(initialState, showPrevStep());
    expect(actual.activeStep).toEqual(1);
  });

  it('should decrease the step value and set isOnboarding to false', () => {
    let actual = onboardingReducer(initialState, showPrevStep());
    actual = onboardingReducer(actual, showPrevStep());
    expect(actual.activeStep).toEqual(0);
    expect(actual.isOnboarding).toBeFalsy();
  });

  it('should update the maxSteps value', () => {
    const actual = onboardingReducer(initialState, updateMaxSteps(4));
    expect(actual.maxSteps).toEqual(4);
  });
});
