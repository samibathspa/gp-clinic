// A row of toggle buttons where one option is selected (used for filters).

export default function ChoiceGroup({ label, options, value, onChange, name }) {
  return (
    <fieldset className="choice-group">
      <legend className="choice-group__label">{label}</legend>
      <div className="choice-group__options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            name={name}
            className="chip"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
