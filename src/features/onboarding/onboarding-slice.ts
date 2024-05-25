import { createSlice } from '@reduxjs/toolkit';

export interface OnboardingState {
  isOnboarding: boolean;
  activeStep: number;
  maxSteps: number;
}

const initialState: OnboardingState = {
  isOnboarding: false,
  activeStep: 0,
  maxSteps: 3,
};


export const OnboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    hideOnboarding: (state) => {
      state.isOnboarding = false;
      state.activeStep = 0;
    },
    showOnboarding: (state) => {
      state.activeStep = 1;
      state.isOnboarding = true;
    },
    showNextStep: (state) => {
      state.activeStep += 1;
      if (state.activeStep > state.maxSteps) {
        state.isOnboarding = false;
      }
    },
    showPrevStep: (state) => {
      state.activeStep -= 1;
      if (state.activeStep < 1) {
        state.isOnboarding = false;
      }
    },
    updateMaxSteps: (state, action) => {
      if (action.payload) {
        state.maxSteps = action.payload;
      }
    },
  },
});

export const { hideOnboarding, showOnboarding, showNextStep, showPrevStep } = OnboardingSlice.actions;

export default OnboardingSlice.reducer;
