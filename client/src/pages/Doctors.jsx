// "Our GPs" page: list of doctors filtered on the server by gender and weekday/weekend.
// Generated with Claude (Anthropic).
import { useEffect, useState } from 'react';
import { sendGETRequest } from '../api.js';
import ChoiceGroup from '../components/ChoiceGroup.jsx';
import DoctorCard from '../components/DoctorCard.jsx';

const GENDER_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];
const DAY_OPTIONS = [
  { value: 'any', label: 'Any day' },
  { value: 'weekday', label: 'Weekdays' },
  { value: 'weekend', label: 'Weekends' },
];

export default function Doctors() {
  const [gender, setGender] = useState('any');
  const [day, setDay] = useState('any');
  const [gps, setGps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch again every time a filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (gender !== 'any') params.set('gender', gender);
    if (day !== 'any') params.set('day', day);

    setLoading(true);
    sendGETRequest(`/api/gps?${params}`)
      .then((data) => { setGps(data); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [gender, day]);

  return (
    <div className="page doctors">
      <header className="page__header">
        <h1>Our GPs</h1>
        <p className="section__lead">Filter by doctor and availability, then book directly with the GP you prefer.</p>
      </header>

      <div className="filters">
        <ChoiceGroup label="Doctor" name="gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
        <ChoiceGroup label="Available on" name="day" options={DAY_OPTIONS} value={day} onChange={setDay} />
      </div>

      <p className="results-count" aria-live="polite">
        {loading ? 'Loading doctors…' : `${gps.length} ${gps.length === 1 ? 'doctor' : 'doctors'} found`}
      </p>

      {error && <p className="alert alert--error" role="alert">{error}</p>}

      <div className={`doctor-grid ${loading ? 'is-loading' : ''}`}>
        {gps.map((gp) => <DoctorCard key={gp.id} gp={gp} />)}
      </div>

      {!loading && !error && gps.length === 0 && (
        <p className="empty">No doctors match these filters. Try “Any day”.</p>
      )}
    </div>
  );
}
