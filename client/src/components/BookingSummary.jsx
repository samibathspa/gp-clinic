// Summary of the current booking choices plus the main action button.
// On phones this becomes a sticky bar at the bottom of the screen (see CSS).
import { formatPrice, formatShortDate } from '../utils/format.js';

export default function BookingSummary({ type, gpLabel, date, slot, actionLabel, actionDisabled, onAction, busy }) {
  return (
    <aside className="summary" aria-label="Your booking">
      <h2 className="summary__title">Your booking</h2>
      <dl className="summary__list">
        <div><dt>Appointment</dt><dd>{type ? `${type.name} (${type.durationMins} min)` : '—'}</dd></div>
        <div><dt>Doctor</dt><dd>{slot ? slot.gpName : gpLabel}</dd></div>
        <div><dt>Date</dt><dd>{date ? formatShortDate(date) : '—'}</dd></div>
        <div><dt>Time</dt><dd>{slot ? slot.time : '—'}</dd></div>
        {slot && <div><dt>Price band</dt><dd>{slot.bandLabel}</dd></div>}
      </dl>

      <div className="summary__footer">
        <p className="summary__total" aria-live="polite">
          <span>Total</span>
          <strong>{slot ? formatPrice(slot.price) : type ? `from ${formatPrice(type.basePrice)}` : '—'}</strong>
        </p>
        {onAction && (
          <button
            type="button"
            className="button button--primary summary__action"
            disabled={actionDisabled || busy}
            onClick={onAction}
          >
            {busy ? 'Please wait…' : actionLabel}
          </button>
        )}
      </div>
    </aside>
  );
}
