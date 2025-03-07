import { Link } from 'react-router-dom';

function Thanks() {
  return (
    <div className="thanks container-fluid d-flex justify-content-center align-items-center vw-100 vh-100">
      <main className="row text-center d-flex align-items-center">
        <h1 className="pb-4">Thanks!</h1>
        <p>
          We&apos;ve received your submission.
        </p>
        <div className="col-6 mx-auto">
          <Link className="btn btn-outline-primary mt-5" to="/">
            Back
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Thanks;
