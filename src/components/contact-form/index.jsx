import PropTypes from 'prop-types';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import './contact-form.css';

const noop = (e) => {};

function ContactForm({
  className = null,
  disabled = false,
  formProps = {
    action: '/submit',
    acceptCharset: 'UTF-8',
    encType: null,
    method: 'GET',
  },
  onSubmit = noop,
  validated = false
}) {

  const AcceptTermsLabel = (
    <span>
      By submitting this form, I accept the <a href="./privacy" target="_blank">Privacy Policy</a> and the <a href="./terms" target="_blank">Terms and Conditions</a> of this site.
    </span>
  );
  return (
    <Form
      id="contact-form"
      className={className}
      noValidate validated={validated}
      action={formProps.action}
      acceptCharset={formProps.acceptCharset}
      encType={formProps.encType}
      method={formProps.method}
      onSubmit={onSubmit}
      data-testid="contact-form"
    >
      <div className="row">
        <Form.Group controlId="contact.Full_Name" className="col-md-6 mb-3">
          <Form.Label>Full Name *</Form.Label>
          <Form.Control
            required
            type="text"
            name="Full Name"
            placeholder="First name"
            disabled={disabled}
          />
          <Form.Control.Feedback type="invalid">
            Please enter your full name
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="contact.Email_Address" className="col-md-6 mb-3">
          <Form.Label>Email Address *</Form.Label>
          <Form.Control
            required
            type="email"
            name="Email Address"
            disabled={disabled}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid email address
          </Form.Control.Feedback>
        </Form.Group>
      </div>
      <Form.Group controlId="contact.Category" className="mb-3">
        <Form.Label>Category <sup>*</sup></Form.Label>
        <Form.Select
          required
          aria-label="Choose a category"
          name="Category"
          defaultValue=""
          disabled={disabled}
        >
          <option value="">
            -----
          </option>
          <option>
            General Inquiry
          </option>
          <option>
            Feedback / Suggestions
          </option>
          <option>
            Technical Issues
          </option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          Please select a category
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="contact.Subject" className="mb-3">
        <Form.Label>Subject *</Form.Label>
        <Form.Control
          required
          type="text"
          name="Subject"
          disabled={disabled}
        />
        <Form.Control.Feedback type="invalid">
          Please enter a valid subject
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="contact.Message" className="mb-3">
        <Form.Label>Message *</Form.Label>
        <Form.Control
          required
          as="textarea"
          name="Message"
          disabled={disabled}
        />
        <Form.Control.Feedback type="invalid">
          Please enter your message.
        </Form.Control.Feedback>
      </Form.Group>

      <div style={{opacity:0,position:'absolute',top:0,left:'-5000px',height:0,width:0}}>
        <label htmlFor="subscribe_a7fdfc1ea41e_48062"></label>
        <input name="subscribe_a7fdfc1ea41e_48062" value="" tabIndex="-1" autoComplete="off"
          type="email" id="email_subscribe_a7fdfc1ea41e_48062" placeholder="Your email here" onChange={noop} disabled={disabled} />
      </div>
      <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response" value="" autoComplete="off" onChange={noop} disabled={disabled} />
      <input type="hidden" name="Browser_Info" id="browser-info" value={`${navigator.userAgent} | ${navigator.language}`} autoComplete="off" readOnly disabled={disabled} />

      <Form.Group controlId="contact.AcceptTerms" className="mb-3">
        <Form.Check
          inline
          required
          label={AcceptTermsLabel}
          name="AcceptTerms"
          type="checkbox"
          feedback="You must agree before submitting."
          feedbackType="invalid"
        />
      </Form.Group>
      <div className="my-3">
        <sup>*</sup> All fields are required.
      </div>
      <Button type="submit" disabled={disabled}>
        Submit
      </Button>
    </Form>
  );
}
ContactForm.propTypes = {
  disabled: PropTypes.bool,
  formProps: PropTypes.object,
  onSubmit: PropTypes.any,
};

export default ContactForm;
export {noop};
