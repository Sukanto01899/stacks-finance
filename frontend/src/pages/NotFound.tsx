import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="stack">
      <div className="panel">
        <h2>Page not found</h2>
        <p>
          The route you requested doesn’t exist yet. Try the contracts list
          instead.
        </p>
        <Link className="cta-button" to="/contracts">
          Go to contracts
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
