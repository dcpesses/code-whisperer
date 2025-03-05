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
    action: '/thanks',
    acceptCharset: 'UTF-8',
    encType: 'multipart/form-data',
    method: 'GET',
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
        <div className="col-6 mx-auto">
          <Link className="btn btn-outline-primary btn-lg mt-5" to="/">
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Contact;
