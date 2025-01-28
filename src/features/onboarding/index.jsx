import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { hideOnboarding, showNextStep, showPrevStep } from './onboarding-slice';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import './onboarding.css';

const OnboardingOverlay = ({ btnOptions, className, children, content, placement, step }) => {
  const onboarding = useSelector((state) => state.onboarding);
  const dispatch = useDispatch();

  const nextHandler = (e) => {
    e.preventDefault();
    dispatch(showNextStep());
  };
  const prevHandler = (e) => {
    e.preventDefault();
    dispatch(showPrevStep());
  };
  const skipHandler = (e) => {
    e.preventDefault();
    dispatch(hideOnboarding());
  };

  /*

  TODO: Finish implementing all of these options
  btnOptions = {
    bsVariants: {
      done: 'primary',
      next: 'primary',
      prev: 'secondary',
    },
    icons: {
      done: (<i className="bi bi-check-circle-fill"></i>),
      next: (<i className="bi bi-arrow-right-circle-fill"></i>),
      prev: (<i className="bi bi-arrow-left-circle-fill"></i>),
    },
    label: {
      done: 'Done',
      next: 'Next',
      prev: 'Prev',
    },
    showIcons: true,
    showText: true,
  };
  */

  const doneIcon = btnOptions?.icons?.done
  || (<i className="bi bi-check-circle-fill"></i>);
  const nextIcon = btnOptions?.icons?.next
  || (<i className="bi bi-arrow-right-circle-fill"></i>);
  const prevIcon = btnOptions?.icons?.prev
    || (<i className="bi bi-arrow-left-circle-fill"></i>);
  const stepIcon = (<i className="bi bi-card-checklist"></i>);

  const showIcons = btnOptions?.showIcons || true;
  const showText = btnOptions?.showText || true;

  const labels = {
    done: 'Done',
    next: 'Next',
    prev: 'Back',
  };

  const popover = (
    <Popover className="onboarding-popover">
      <Popover.Header as="h3">
        <span>
          {stepIcon} Step {step} of {onboarding.maxSteps}
        </span>
        <button type="button" className="btn-close ms-auto p-0" aria-label="Close" title="Skip and Close" onClick={skipHandler} />
      </Popover.Header>
      <Popover.Body className="rounded-bottom raleway-font">
        {content}
        <div className="d-flex justify-content-between pt-3">
          <Button variant="secondary" size="sm" onClick={prevHandler}
            disabled={(step - 1 === 0)}>
            {showIcons === true ? prevIcon : '❮'}
            {showText === true && ` ${labels.prev}`}
          </Button>
          <Button size="sm" onClick={nextHandler}>
            {
              (showText === true)
                ? (onboarding.maxSteps === step) ? `${labels.done} ` : `${labels.next} `
                : null
            }
            {
              (showIcons === true)
                ? (onboarding.maxSteps === step) ? doneIcon : nextIcon
                : '❯'
            }
          </Button>
        </div>
      </Popover.Body>
    </Popover>
  );

  const active = (onboarding.activeStep === step);

  const onboardingClassNames = [
    className,
    (active) ? 'onboarding-active' : null
  ].filter(c => c).join(' ');

  return (
    <OverlayTrigger
      overlay={popover}
      placement={placement}
      show={active}
      trigger={[]}
    >
      <div className={onboardingClassNames}>
        {children}
      </div>
    </OverlayTrigger>
  );
};

OnboardingOverlay.propTypes = {
  btnOptions: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  className: PropTypes.string,
  content: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  placement: PropTypes.string,
  step: PropTypes.number,
};
OnboardingOverlay.defaultProps = {
  btnOptions: {
    showIcons: true,
    showText: true,
  },
  className: null,
  placement: 'top',
  step: -1
};

export default OnboardingOverlay;
