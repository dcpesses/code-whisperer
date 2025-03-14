import { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/contact-form';

function Contact() {

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event: SubmitEvent) => {
    const form:HTMLFormElement = event.currentTarget as HTMLFormElement;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  const formProps = {
    action: 'https://apps.dannyzone.com/contact_debug/',
    acceptCharset: 'UTF-8',
    encType: null,
    method: 'POST',
  };
  return (
    <div className="contact container" data-testid="contact">
      <main className="px-3">
        <h1 className="py-4">Contact Us</h1>
        <ContactForm
          disabled={false}
          formProps={formProps}
          onSubmit={handleSubmit}
          validated={validated}
        />
        <div className="mx-auto">
          <Link className="btn btn-outline-primary btn-lg mt-5" to="/">
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Contact;
