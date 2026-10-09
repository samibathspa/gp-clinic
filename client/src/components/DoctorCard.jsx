// Card showing one GP's details and weekly hours.
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { DAYS, worksWeekends } from '../utils/format.js';

export default function DoctorCard({ gp }) {
  return (
    <article className="doctor-card">
      <header className="doctor-card__header">
        <Avatar name={gp.name} gender={gp.gender} size="lg" />
        <div>
          <h2 className="doctor-card__name">{gp.name}</h2>
          <p className="doctor-card__meta">
            {gp.gender === 'female' ? 'Female' : 'Male'} GP
            {worksWeekends(gp) && <span className="badge badge--accent">Weekends</span>}
          </p>
        </div>
      </header>

      <p className="doctor-card__bio">{gp.bio}</p>

      <dl className="doctor-card__facts">
        <div><dt>Interests</dt><dd>{gp.interests.join(', ')}</dd></div>
        <div><dt>Languages</dt><dd>{gp.languages.join(', ')}</dd></div>
      </dl>

      <table className="hours">
        <caption className="visually-hidden">Working hours for {gp.name}</caption>
        <tbody>
          {DAYS.map((day) => {
            const hours = gp.schedule[day.key];
            return (
              <tr key={day.key} className={hours ? '' : 'hours__off'}>
                <th scope="row">{day.label}</th>
                <td>{hours ? `${hours[0]}–${hours[1]}` : 'Not working'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Link to={`/book?gp=${gp.id}`} className="button button--primary button--block">
        Book with Dr {gp.name.split(' ').at(-1)}
      </Link>
    </article>
  );
}
