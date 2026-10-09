// Booking flow: appointment type -> doctor -> date & time -> details -> confirmation.
// Phones show one step at a time with a sticky price bar; desktops add a summary sidebar.
// availability from the API, groups slots by time of day and handles double-booking errors".
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sendGETRequest, sendRequest } from '../api.js';
import StepIndicator from '../components/StepIndicator.jsx';
import BookingSummary from '../components/BookingSummary.jsx';
import ChoiceGroup from '../components/ChoiceGroup.jsx';
import Avatar from '../components/Avatar.jsx';
import { formatPrice, formatShortDate, formatLongDate, parseDate } from '../utils/format.js';
import { isValidUkPhone } from '../utils/validate.js';

const STEPS = ['Appointment', 'Doctor', 'Date & time', 'Your details'];
const GENDER_OPTIONS = [
  { value: 'any', label: 'No preference' },
  { value: 'female', label: 'Female GP' },
  { value: 'male', label: 'Male GP' },
];
const WHEN_OPTIONS = [
  { value: 'any', label: 'Any day' },
  { value: 'weekday', label: 'Weekdays' },
  { value: 'weekend', label: 'Weekends' },
];
const EMPTY_DETAILS = { name: '', email: '', phone: '', notes: '' };

// Split slots into morning / afternoon / evening for easier scanning
function groupSlots(slots) {
  const groups = [
    { id: 'morning', label: 'Morning', slots: [] },
    { id: 'afternoon', label: 'Afternoon', slots: [] },
    { id: 'evening', label: 'Evening', slots: [] },
  ];
  for (const slot of slots) {
    const hour = Number(slot.time.slice(0, 2));
    groups[hour < 12 ? 0 : hour < 17 ? 1 : 2].slots.push(slot);
  }
  return groups.filter((g) => g.slots.length);
}

// Same rules as the server, so users get instant feedback
function validateDetails(d) {
  const errors = {};
  if (d.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.email = 'Enter a valid email address';
  if (!isValidUkPhone(d.phone)) errors.phone = 'Enter a UK phone number, e.g. 07700 900123';
  return errors;
}

export default function Book() {
  const [searchParams] = useSearchParams();

  // Data from the server
  const [types, setTypes] = useState([]);
  const [gps, setGps] = useState([]);
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState([]);

  // The user's choices
  const [step, setStep] = useState(0);
  const [typeId, setTypeId] = useState('');
  const [gender, setGender] = useState('any');
  const [gpId, setGpId] = useState(searchParams.get('gp') || 'any');
  const [when, setWhen] = useState('any');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(null);
  const [details, setDetails] = useState(EMPTY_DETAILS);

  // UI state
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(null);

  const type = types.find((t) => t.id === typeId);
  const selectedGp = gps.find((g) => g.id === gpId);
  const gpLabel = selectedGp ? selectedGp.name : gender === 'any' ? 'First available' : `First available ${gender} GP`;

  // Load appointment types and doctors once
  useEffect(() => {
    Promise.all([sendGETRequest('/api/appointment-types'), sendGETRequest('/api/gps')])
      .then(([typeData, gpData]) => { setTypes(typeData); setGps(gpData); })
      .catch((err) => setError(err.message));
  }, []);

  // Scroll to the top whenever the step changes (important on phones)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step, booking]);

  // On the date step, load how many free slots each day has
  useEffect(() => {
    if (step !== 2 || !typeId) return;
    const params = new URLSearchParams({ type: typeId, gp: gpId, gender, days: 14 });
    setLoadingDays(true);
    sendGETRequest(`/api/availability/days?${params}`)
      .then((data) => { setDays(data); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDays(false));
  }, [step, typeId, gpId, gender]);

  // When a date is picked, load its free slots
  useEffect(() => {
    if (!date || !typeId) { setSlots([]); return; }
    const params = new URLSearchParams({ date, type: typeId, gp: gpId, gender });
    setLoadingSlots(true);
    sendGETRequest(`/api/availability?${params}`)
      .then((data) => { setSlots(data.slots); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSlots(false));
  }, [date, typeId, gpId, gender]);

  // Changing an earlier choice clears the chosen time, because it may no longer be valid
  function chooseType(id) { setTypeId(id); setSlot(null); }
  function chooseGp(id) { setGpId(id); setSlot(null); }
  function chooseDate(d) { setDate(d); setSlot(null); }
  function chooseGender(value) {
    setGender(value);
    setSlot(null);
    // If the chosen doctor doesn't match the new preference, go back to "first available"
    if (selectedGp && value !== 'any' && selectedGp.gender !== value) setGpId('any');
  }

  const visibleDays = useMemo(
    () => days.filter((d) => when === 'any' || (when === 'weekend' ? d.isWeekend : !d.isWeekend)),
    [days, when]
  );
  const visibleGps = gps.filter((g) => gender === 'any' || g.gender === gender);
  const detailErrors = validateDetails(details);

  const canContinue = [Boolean(type), true, Boolean(slot), Object.keys(detailErrors).length === 0][step];

  async function submitBooking() {
    setFieldErrors(detailErrors);
    if (Object.keys(detailErrors).length) return;

    setBusy(true);
    setError('');
    try {
      const result = await sendRequest('/api/bookings', 'POST', {
        typeId, gpId: slot.gpId, date, time: slot.time,
        patient: { name: details.name, email: details.email, phone: details.phone },
        notes: details.notes,
      });
      setBooking(result);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fields || {});
      // Someone else took the slot: send the user back to pick another time
      if (err.status === 409) {
        setStep(2);
        setSlot(null);
        setSlots((current) => current.filter((s) => s.time !== slot.time));
      }
    } finally {
      setBusy(false);
    }
  }

  function handleAction() {
    if (step < 3) setStep(step + 1);
    else submitBooking();
  }

  function startAgain() {
    setBooking(null); setStep(0); setTypeId(''); setGpId('any'); setGender('any');
    setDate(''); setSlot(null); setDetails(EMPTY_DETAILS); setFieldErrors({});
  }

  // ----- Confirmation screen -----
  if (booking) {
    return (
      <div className="page page--narrow confirmation">
        <div className="confirmation__icon" aria-hidden="true">✓</div>
        <h1>Appointment booked</h1>
        <p className="section__lead">We've sent a confirmation to {booking.patient.email} (not really, this is a demo).</p>

        <div className="card confirmation__card">
          <p className="confirmation__ref">Booking reference <strong>{booking.reference}</strong></p>
          <dl className="summary__list">
            <div><dt>Appointment</dt><dd>{booking.typeName}</dd></div>
            <div><dt>Doctor</dt><dd>{booking.gpName}</dd></div>
            <div><dt>When</dt><dd>{formatLongDate(booking.date)} at {booking.time}</dd></div>
            <div><dt>Price</dt><dd>{formatPrice(booking.price)} ({booking.bandLabel})</dd></div>
          </dl>
        </div>

        <div className="confirmation__actions">
          <Link
            className="button button--ghost"
            to={`/manage?ref=${booking.reference}&email=${encodeURIComponent(booking.patient.email)}`}
          >
            View or cancel booking
          </Link>
          <button className="button button--primary" onClick={startAgain}>Book another appointment</button>
        </div>
      </div>
    );
  }

  // ----- Booking steps -----
  return (
    <div className="page book">
      <header className="book__header">
        <h1>Book an appointment</h1>
        <StepIndicator steps={STEPS} current={step} onStepClick={setStep} />
      </header>

      <div className="book__main">
        {error && <p className="alert alert--error" role="alert">{error}</p>}

        {step === 0 && (
          <section aria-labelledby="step-type">
            <h2 id="step-type" className="step-title">What type of appointment do you need?</h2>
            <div className="option-list" role="radiogroup" aria-label="Appointment type">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={typeId === t.id}
                  className="option-card"
                  onClick={() => chooseType(t.id)}
                >
                  <span className="option-card__top">
                    <strong>{t.name}</strong>
                    <span className="option-card__price">from {formatPrice(t.basePrice)}</span>
                  </span>
                  <span className="option-card__desc">{t.description}</span>
                  <span className="option-card__tags">
                    <span className="badge">{t.durationMins} min</span>
                    <span className="badge">{t.mode}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="step-doctor">
            <h2 id="step-doctor" className="step-title">Who would you like to see?</h2>
            <ChoiceGroup label="Doctor preference" name="gender" options={GENDER_OPTIONS} value={gender} onChange={chooseGender} />

            <div className="option-list option-list--doctors" role="radiogroup" aria-label="Doctor">
              <button
                type="button"
                role="radio"
                aria-checked={gpId === 'any'}
                className="option-card option-card--row"
                onClick={() => chooseGp('any')}
              >
                <span className="avatar avatar--md avatar--any" aria-hidden="true">★</span>
                <span>
                  <strong>First available</strong>
                  <span className="option-card__desc">Most choice of times{gender !== 'any' ? ` with a ${gender} GP` : ''}</span>
                </span>
              </button>
              {visibleGps.map((gp) => (
                <button
                  key={gp.id}
                  type="button"
                  role="radio"
                  aria-checked={gpId === gp.id}
                  className="option-card option-card--row"
                  onClick={() => chooseGp(gp.id)}
                >
                  <Avatar name={gp.name} gender={gp.gender} />
                  <span>
                    <strong>{gp.name}</strong>
                    <span className="option-card__desc">{gp.interests.join(' · ')}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="step-date">
            <h2 id="step-date" className="step-title">Choose a day and time</h2>
            <ChoiceGroup label="Show" name="when" options={WHEN_OPTIONS} value={when} onChange={setWhen} />

            <h3 className="sub-title">Day</h3>
            {loadingDays && <p className="muted" aria-live="polite">Checking availability…</p>}
            <div className="date-strip" role="radiogroup" aria-label="Date">
              {visibleDays.map((d) => {
                const dt = parseDate(d.date);
                const full = d.freeSlots === 0;
                return (
                  <button
                    key={d.date}
                    type="button"
                    role="radio"
                    aria-checked={date === d.date}
                    aria-label={`${formatLongDate(d.date)}, ${full ? 'fully booked' : `${d.freeSlots} times available`}`}
                    disabled={full}
                    className={`date-chip ${d.isWeekend ? 'date-chip--weekend' : ''}`}
                    onClick={() => chooseDate(d.date)}
                  >
                    <span className="date-chip__day">{dt.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                    <span className="date-chip__num">{dt.getDate()}</span>
                    <span className="date-chip__month">{dt.toLocaleDateString('en-GB', { month: 'short' })}</span>
                    <span className="date-chip__info">{full ? 'Full' : `from ${formatPrice(d.fromPrice)}`}</span>
                  </button>
                );
              })}
            </div>

            {date && (
              <div className="slots" aria-live="polite">
                <h3 className="sub-title">Times on {formatShortDate(date)}</h3>
                {loadingSlots && (
                  <div className="slot-grid" aria-hidden="true">
                    {Array.from({ length: 8 }, (_, i) => <span key={i} className="slot slot--skeleton" />)}
                  </div>
                )}
                {!loadingSlots && slots.length === 0 && <p className="empty">No times left on this day. Try another date.</p>}
                {!loadingSlots && groupSlots(slots).map((group) => (
                  <div key={group.id} className="slot-group">
                    <h4>{group.label}</h4>
                    <div className="slot-grid" role="radiogroup" aria-label={`${group.label} times`}>
                      {group.slots.map((s) => (
                        <button
                          key={s.time}
                          type="button"
                          role="radio"
                          aria-checked={slot?.time === s.time}
                          className={`slot slot--${s.band}`}
                          onClick={() => setSlot(s)}
                        >
                          <span className="slot__time">{s.time}</span>
                          <span className="slot__meta">
                            {gpId === 'any' ? s.gpName.replace('Dr ', 'Dr ').split(' ').slice(0, 2).join(' ') : formatPrice(s.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {slots.some((s) => s.band === 'outOfHours') && (
                  <p className="hint"><span className="dot dot--warn" /> Out-of-hours times (before 08:00 or after 18:00) cost a little more.</p>
                )}
              </div>
            )}
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step-details">
            <h2 id="step-details" className="step-title">Your details</h2>
            <p className="muted">Demo only: please use made-up details.</p>
            <form className="form" noValidate onSubmit={(e) => { e.preventDefault(); submitBooking(); }}>
              {[
                { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
                { id: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
                { id: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', placeholder: '07700 900123' },
              ].map((f) => (
                <div key={f.id} className={`field ${fieldErrors[f.id] ? 'field--error' : ''}`}>
                  <label htmlFor={f.id}>{f.label}</label>
                  <input
                    id={f.id}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    value={details[f.id]}
                    aria-invalid={Boolean(fieldErrors[f.id])}
                    aria-describedby={fieldErrors[f.id] ? `${f.id}-error` : undefined}
                    onChange={(e) => setDetails({ ...details, [f.id]: e.target.value })}
                    onBlur={() => setFieldErrors((prev) => {
                      const next = { ...prev };
                      if (detailErrors[f.id] && details[f.id]) next[f.id] = detailErrors[f.id]; else delete next[f.id];
                      return next;
                    })}
                  />
                  {fieldErrors[f.id] && <p id={`${f.id}-error`} className="field__error">{fieldErrors[f.id]}</p>}
                </div>
              ))}
              <div className="field">
                <label htmlFor="notes">Reason for visit <span className="muted">(optional)</span></label>
                <textarea
                  id="notes"
                  rows="3"
                  maxLength="500"
                  value={details.notes}
                  onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                />
              </div>
              {/* Hidden submit so pressing Enter works; the visible button is in the summary */}
              <button type="submit" className="visually-hidden" tabIndex="-1">Confirm booking</button>
            </form>
          </section>
        )}

        {step > 0 && (
          <button type="button" className="button button--text book__back" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        )}
      </div>

      <BookingSummary
        type={type}
        gpLabel={gpLabel}
        date={date}
        slot={slot}
        busy={busy}
        actionLabel={step < 3 ? 'Continue' : `Confirm booking${slot ? ` · ${formatPrice(slot.price)}` : ''}`}
        actionDisabled={!canContinue}
        onAction={handleAction}
      />
    </div>
  );
}
