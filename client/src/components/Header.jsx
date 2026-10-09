// Site header with navigation. On phones the links collapse into a menu button.
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/doctors', label: 'Our GPs' },
  { to: '/manage', label: 'Manage booking' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Close the mobile menu after a link is chosen
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" onClick={closeMenu} aria-label="Riverside Private GP home">
          <span className="brand__mark" aria-hidden="true">+</span>
          <span className="brand__name">Riverside <span>Private GP</span></span>
        </Link>

        <button
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-button__bars" aria-hidden="true" />
          <span className="visually-hidden">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>

        <nav id="main-nav" className={`site-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="site-nav__link" onClick={closeMenu}>
              {link.label}
            </NavLink>
          ))}
          <Link to="/book" className="button button--primary site-nav__cta" onClick={closeMenu}>Book appointment</Link>
        </nav>
      </div>
    </header>
  );
}
