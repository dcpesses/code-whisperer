import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { hideOnboarding, showNextStep } from './onboarding-slice';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

const OnboardingOverlay = ({ body, children, placement, step }) => {
  const onboarding = useSelector((state) => state.onboarding);
  const dispatch = useDispatch();

  const nextHandler = (e) => {
    e.preventDefault();
    dispatch(showNextStep());
  };

  const skipHandler = (e) => {
    e.preventDefault();
    dispatch(hideOnboarding());
  };

  const popover = (
    <Popover>
      <Popover.Header as="h3">
        Step {step} of {onboarding.maxSteps}
      </Popover.Header>
      <Popover.Body>
        {body}
        <div className="d-flex justify-content-between pt-3">
          <Button variant="secondary" size="sm" onClick={skipHandler}>Skip</Button>

          <Button size="sm" onClick={nextHandler}>
            {(onboarding.maxSteps === step) ? 'Done' : 'Next'}
          </Button>
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger overlay={popover} trigger={[]} placement={placement} show={onboarding.activeStep === step}>
      {children}
    </OverlayTrigger>
  );
};

OnboardingOverlay.propTypes = {
  body: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  placement: PropTypes.string,
  step: PropTypes.number,
};
OnboardingOverlay.defaultProps = {
  placement: 'top',
  step: -1
};

export default OnboardingOverlay;
