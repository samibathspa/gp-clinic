// Root component: sets up page routes.
// Scaffold generated with Claude (Anthropic).
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Home() {
  const [status, setStatus] = useState('checking...');
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setStatus(d.status))
      .catch(() => setStatus('API not reachable'));
  }, []);
  return (
    <main>
      <h1>GP Clinic</h1>
      <p>API status: {status}</p>
    </main>
  );
}

// TODO (you): create pages in src/pages/ (Doctors, Book, ManageBooking) and add routes below
export default function App() {
  return (
    <BrowserRouter>
      <nav><Link to="/">Home</Link></nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
