// Root component: page layout and routes.
// Generated with Claude (Anthropic).
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Doctors from './pages/Doctors.jsx';
import Book from './pages/Book.jsx';
import ManageBooking from './pages/ManageBooking.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="app">
        <Header />
        <main id="main" className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/book" element={<Book />} />
            <Route path="/manage" element={<ManageBooking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
