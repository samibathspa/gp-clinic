// Progress bar for the booking flow ("Step 2 of 4").

export default function StepIndicator({ steps, current, onStepClick }) {
  return (
    <nav className="steps" aria-label="Booking progress">
      <p className="steps__mobile">Step {current + 1} of {steps.length}: <strong>{steps[current]}</strong></p>
      <div className="steps__bar" aria-hidden="true">
        <span style={{ width: `${((current + 1) / steps.length) * 100}%` }} />
      </div>
      <ol className="steps__list">
        {steps.map((label, i) => (
          <li key={label} className={i < current ? 'is-done' : i === current ? 'is-current' : ''}>
            {/* Completed steps can be clicked to go back */}
            <button
              type="button"
              disabled={i >= current}
              aria-current={i === current ? 'step' : undefined}
              onClick={() => onStepClick(i)}
            >
              <span className="steps__num">{i < current ? '✓' : i + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
