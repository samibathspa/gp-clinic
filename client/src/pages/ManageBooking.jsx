// Look up a booking by reference + email, and cancel it.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sendGETRequest, sendRequest } from '../api.js';
import { formatPrice, formatLongDate } from '../utils/format.js';

export default function ManageBooking() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function lookUp(ref = reference, mail = email) {
    setLoading(true); setError(''); setMessage(''); setConfirming(false);
    try {
      const data = await sendGETRequest(`/api/bookings/${encodeURIComponent(ref.trim())}?email=${encodeURIComponent(mail.trim())}`);
      setBooking(data);
    } catch (err) {
      setBooking(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Coming from the confirmation page: look the booking up straight away
  useEffect(() => {
    if (searchParams.get('ref') && searchParams.get('email')) lookUp(searchParams.get('ref'), searchParams.get('email'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function cancelBooking() {
    setLoading(true); setError('');
    try {
      const data = await sendRequest(`/api/bookings/${booking.reference}`, 'DELETE', { email: booking.patient.email });
      setBooking(data);
      setMessage('Your appointment has been cancelled and the time is now free for other patients.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  const cancelled = booking?.status === 'cancelled';

  return (
    <div className="page page--narrow manage">
      <h1>Manage your booking</h1>
      <p className="section__lead">Enter the reference from your confirmation and the email you booked with.</p>

      <form className="form card" onSubmit={(e) => { e.preventDefault(); lookUp(); }}>
        <div className="form__row">
          <div className="field">
            <label htmlFor="ref">Booking reference</label>
            <input id="ref" value={reference} placeholder="GP-ABC123" autoCapitalize="characters"
              onChange={(e) => setReference(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="lookup-email">Email</label>
            <input id="lookup-email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <button className="button button--primary" disabled={loading || !reference || !email}>
          {loading && !booking ? 'Searching…' : 'Find booking'}
        </button>
      </form>

      {error && <p className="alert alert--error" role="alert">{error}</p>}
      {message && <p className="alert alert--success" role="status">{message}</p>}

      {booking && (
        <article className={`card booking-card ${cancelled ? 'is-cancelled' : ''}`}>
          <header className="booking-card__header">
            <h2>{booking.typeName}</h2>
            <span className={`badge ${cancelled ? 'badge--danger' : 'badge--success'}`}>
              {cancelled ? 'Cancelled' : 'Confirmed'}
            </span>
          </header>
          <dl className="summary__list">
            <div><dt>Reference</dt><dd>{booking.reference}</dd></div>
            <div><dt>Doctor</dt><dd>{booking.gpName}</dd></div>
            <div><dt>When</dt><dd>{formatLongDate(booking.date)} at {booking.time}</dd></div>
            <div><dt>Length</dt><dd>{booking.durationMins} minutes</dd></div>
            <div><dt>Price</dt><dd>{formatPrice(booking.price)} ({booking.bandLabel})</dd></div>
            <div><dt>Patient</dt><dd>{booking.patient.name}</dd></div>
          </dl>

          {!cancelled && !confirming && (
            <button className="button button--danger-outline" onClick={() => setConfirming(true)}>
              Cancel appointment
            </button>
          )}
          {confirming && (
            <div className="confirm-box" role="alertdialog" aria-labelledby="confirm-text">
              <p id="confirm-text">Are you sure you want to cancel this appointment?</p>
              <div className="confirm-box__actions">
                <button className="button button--danger" onClick={cancelBooking} disabled={loading}>
                  {loading ? 'Cancelling…' : 'Yes, cancel it'}
                </button>
                <button className="button button--ghost" onClick={() => setConfirming(false)}>Keep appointment</button>
              </div>
            </div>
          )}
          {cancelled && <Link to="/book" className="button button--primary">Book a new appointment</Link>}
        </article>
      )}
    </div>
  );
}
