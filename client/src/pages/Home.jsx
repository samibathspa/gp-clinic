// Home page: introduction, key features and the live price list.
// Generated with Claude (Anthropic).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendGETRequest } from '../api.js';
import { formatPrice } from '../utils/format.js';

// Opening hours for each group of days, worked out from every doctor's schedule
// (earliest start to latest finish), so the card always matches the real data.
const HOUR_GROUPS = [
  { label: 'Mon–Fri', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
  { label: 'Saturday', days: ['sat'] },
  { label: 'Sunday', days: ['sun'] },
];

function clinicHours(gps) {
  return HOUR_GROUPS.map((group) => {
    const shifts = gps.flatMap((gp) => group.days.map((d) => gp.schedule[d]).filter(Boolean));
    if (!shifts.length) return { label: group.label, hours: 'Closed' };
    const open = shifts.map((s) => s[0]).sort()[0];
    const close = shifts.map((s) => s[1]).sort().at(-1);
    return { label: group.label, hours: `${open}–${close}` };
  });
}

const FEATURES = [
  { title: 'Seen within days', text: 'Same-week appointments, including early mornings and evenings.' },
  { title: 'Choose your GP', text: 'Pick a female or male doctor, or simply the first available.' },
  { title: 'Weekend clinics', text: 'Saturday and Sunday appointments for when weekdays don\'t work.' },
];

export default function Home() {
  const [pricing, setPricing] = useState(null);
  const [hours, setHours] = useState([]);
  const [error, setError] = useState('');

  // Load the price table from the server when the page opens
  useEffect(() => {
    sendGETRequest('/api/gps')
      .then((gps) => setHours(clinicHours(gps)))
      .catch(() => setHours([]));
    sendGETRequest('/api/pricing')
      .then(setPricing)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Private GP practice in Bath</p>
          <h1>See a GP when it suits you, <span>not just 9 to 5.</span></h1>
          <p className="hero__lead">
            Book a face-to-face or video appointment in under a minute. Weekday, evening and weekend slots available.
          </p>
          <div className="hero__actions">
            <Link to="/book" className="button button--primary button--large">Book an appointment</Link>
            <Link to="/doctors" className="button button--ghost button--large">Meet our GPs</Link>
          </div>
        </div>

        <div className="hero__card">
          <p className="hero__card-label">Clinic hours</p>
          <p className="hero__card-time">Open 7 days</p>
          <dl className="hero__hours">
            {hours.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
          <p className="hero__card-note">Appointments before 08:00 or after 18:00 on weekdays are charged at the out-of-hours rate.</p>
        </div>

        <ul className="features">
          {FEATURES.map((f) => (
            <li key={f.title} className="feature">
              <h2>{f.title}</h2>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="prices-heading">
        <h2 id="prices-heading" className="section__title">Appointment prices</h2>
        <p className="section__lead">The price depends on when you are seen. You will always see the final price before you confirm.</p>

        {error && <p className="alert alert--error" role="alert">{error}</p>}
        {!pricing && !error && <p className="muted">Loading prices…</p>}

        {pricing && (
          <>
            <ul className="bands">
              {pricing.bands.map((band) => (
                <li key={band.id} className={`band band--${band.id}`}>
                  <strong>{band.label}</strong>
                  <span>{band.description}</span>
                </li>
              ))}
            </ul>

            <div className="table-wrap">
              <table className="price-table">
                <thead>
                  <tr>
                    <th scope="col">Appointment</th>
                    {pricing.bands.map((band) => <th key={band.id} scope="col">{band.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {pricing.table.map((row) => (
                    <tr key={row.typeId}>
                      <th scope="row">{row.name}<span>{row.durationMins} min</span></th>
                      {pricing.bands.map((band) => (
                        <td key={band.id} data-label={band.label}>{formatPrice(row.prices[band.id])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="section how" aria-labelledby="how-heading">
        <h2 id="how-heading" className="section__title">How booking works</h2>
        <ol className="how__list">
          <li><strong>Choose</strong> your appointment type and doctor.</li>
          <li><strong>Pick</strong> a day and time. Weekend days are highlighted.</li>
          <li><strong>Confirm</strong> and get your booking reference instantly.</li>
        </ol>
        <Link to="/book" className="button button--primary">Start booking</Link>
      </section>
    </div>
  );
}
