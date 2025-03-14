import {render, screen} from '@testing-library/react';
import {UserEvent, userEvent} from '@testing-library/user-event';
import {Mock} from 'vitest';
import ContactForm, {noop} from './index';

describe('noop', () => {
  test('should execute without error', () => {
    expect(noop()).toBeUndefined();
  });
});

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    get: function() {
      return userAgent; // customized user agent
    },
    configurable: true
  });
};

describe('ContactForm', () => {
  const initialUserAgent = navigator.userAgent;
  let onFormSubmitSpy: Mock;
  let setValidated: React.Dispatch<React.SetStateAction<boolean>>;
  let user: UserEvent;

  beforeEach(()=>{
    setUserAgent('Mockzilla/1.0 (X11; Mock x64) HappyDOM/0.0.0');
    onFormSubmitSpy = vi.fn();
    setValidated = vi.fn();
    user = userEvent.setup();
  });

  afterEach(()=>{
    setUserAgent(initialUserAgent);
  });

  const onFormSubmit = (event: SubmitEvent) => {
    const form:HTMLFormElement = event.currentTarget as HTMLFormElement;

    // spy on data via mock.calls
    const formData = new FormData(form);
    const formDataEntries = [...formData.entries()]
      .reduce((acc: Record<string, FormDataEntryValue>, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {}
      );
    onFormSubmitSpy(formDataEntries);

    // actual logic
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      setValidated(true);
    }
  };

  test('Should render as expected', () => {
    render(<ContactForm />);

    const form = screen.getByTestId('contact-form');
    expect(form).toMatchSnapshot();
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  test('should submit when form has valid data', async() => {
    render(<ContactForm disabled={false} onSubmit={onFormSubmit} validated={true} />);

    const form = screen.getByTestId('contact-form');
    expect(form).toMatchSnapshot('pristine');

    const nameInput:HTMLInputElement = screen.getByLabelText('Full Name *');
    const emailInput:HTMLInputElement = screen.getByLabelText('Email Address *');
    const categorySelect:HTMLSelectElement = screen.getByLabelText('Category *');
    const subjectInput:HTMLInputElement = screen.getByLabelText('Subject *');
    const messageInput:HTMLInputElement = screen.getByLabelText('Message *');
    const acceptCheckbox:HTMLFormElement = screen.getByRole('checkbox');
    const btnSubmit:HTMLButtonElement = screen.getByRole('button', { name: 'Submit' });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john.doe@example.com');
    await user.selectOptions(categorySelect, 'Feedback / Suggestions');
    await user.type(subjectInput, 'Great app');
    await user.type(messageInput, 'I love this app!');
    await user.click(acceptCheckbox);

    await user.click(btnSubmit);

    expect(onFormSubmitSpy).toBeCalled();
    expect(onFormSubmitSpy.mock.calls[0][0]).toMatchObject(
      {
        'AcceptTerms': 'on',
        'Category': 'Feedback / Suggestions',
        'Email Address': 'john.doe@example.com',
        'Full Name': 'John Doe',
        'Message': 'I love this app!',
        'Subject': 'Great app',
        'g-recaptcha-response': '',
        'subscribe_a7fdfc1ea41e_48062': '',
      }
    );
    expect(setValidated).toBeCalled();
    expect(form.classList).toContain('was-validated');
    expect(form).toMatchSnapshot('dirty');
  });
  test('should not submit when form has invalid data', async() => {
    const {rerender} = render(<ContactForm disabled={false} onSubmit={onFormSubmit} validated={false} />);

    const form = screen.getByTestId('contact-form');
    expect(form).toMatchSnapshot('pristine');

    const nameInput:HTMLInputElement = screen.getByLabelText('Full Name *');
    const emailInput:HTMLInputElement = screen.getByLabelText('Email Address *');
    const acceptCheckbox:HTMLFormElement = screen.getByRole('checkbox');
    const btnSubmit:HTMLButtonElement = screen.getByRole('button', { name: 'Submit' });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john.doe');

    await user.click(acceptCheckbox);

    await user.click(btnSubmit);

    rerender(<ContactForm disabled={false} onSubmit={onFormSubmit} validated={true} />);

    expect(onFormSubmitSpy).toBeCalled();
    expect(setValidated).not.toBeCalled();

    expect(onFormSubmitSpy.mock.calls[0][0]).toMatchObject(
      {
        'Message': '',
        'Email Address': 'john.doe',
        'Full Name': 'John Doe',
        'g-recaptcha-response': '',
        'subscribe_a7fdfc1ea41e_48062': '',
      }
    );

    expect(nameInput.reportValidity()).toBeTruthy();
    expect(emailInput.reportValidity()).toBeFalsy();

    expect(form.classList).toContain('was-validated');
    expect(form).toMatchSnapshot('dirty');
  });
  test('should not submit when disabled', async() => {
    const {rerender} = render(<ContactForm disabled={true} onSubmit={onFormSubmit} validated={false} />);

    const form = screen.getByTestId('contact-form');
    expect(form).toMatchSnapshot('pristine');

    const btnSubmit = screen.getByRole('button', { name: 'Submit' });

    await user.click(btnSubmit);

    rerender(<ContactForm disabled={false} onSubmit={onFormSubmit} validated={true} />);

    expect(onFormSubmitSpy).not.toBeCalled();
    expect(form).toMatchSnapshot('dirty');
  });
});
