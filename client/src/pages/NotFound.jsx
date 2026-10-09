// Shown for unknown URLs.
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page page--narrow">
      <h1>Page not found</h1>
      <p>The page you were looking for doesn't exist.</p>
      <Link to="/" className="button button--primary">Back to home</Link>
    </div>
  );
}
