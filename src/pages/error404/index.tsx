import { Link } from 'react-router-dom';

function Error404() {
  return (
    <div className="error-404 full-pg d-flex w-100 h-100 my-0 mx-auto flex-column">
      <main className="px-3 text-center">
        <h1 className="display-1 ppb-4">404</h1>
        <p>
          <small className="fst-italic">
            I&apos;m sorry, Dave. I&apos;m afraid I can&apos;t do that.
          </small>
        </p>
        <div className="col-6 mx-auto">
          <Link className="btn btn-outline-primary btn-lg mt-5" to="/">
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Error404;
