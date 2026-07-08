import { Link } from "react-router-dom";
import "../styles/notFound.css";

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1 className="not-found-code">
          404
        </h1>

        <h2 className="not-found-title">
          Page Not Found
        </h2>

        <p className="not-found-text">
          Looks like this page escaped from the Pokédex.
        </p>

        <Link
          to="/"
          className="not-found-btn"
        >
          Back to Pokédex
        </Link>
      </div>
    </div>
  );
}

export default NotFound;