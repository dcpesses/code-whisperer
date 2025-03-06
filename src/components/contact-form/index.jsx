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
    encType: '',
    method: 'GET',
  },
  onSubmit = noop,
  validated = false
}) {

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
      <Form.Group controlId="contact.Full_Name">
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
      <Form.Group controlId="contact.Email_Address">
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
      <Form.Group controlId="contact.Comments_Questions">
        <Form.Label>Comments/Questions *</Form.Label>
        <Form.Control
          required
          as="textarea"
          name="Comments/Questions"
          disabled={disabled}
        />
        <Form.Control.Feedback type="invalid">
          Please enter your feedback.
        </Form.Control.Feedback>
      </Form.Group>

      <div style={{opacity:0,position:'absolute',top:0,left:'-5000px',height:0,width:0}}>
        <label htmlFor="subscribe_a7fdfc1ea41e_48062"></label>
        <input name="subscribe_a7fdfc1ea41e_48062" value="" tabIndex="-1" autoComplete="off"
          type="email" id="email_subscribe_a7fdfc1ea41e_48062" placeholder="Your email here" onChange={noop} disabled={disabled} />
      </div>
      <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response" value="" autoComplete="off" onChange={noop} disabled={disabled} />

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
