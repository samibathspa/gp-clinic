// Circle with a doctor's initials (no real photos are used).
// Generated with Claude (Anthropic).
import { initials } from '../utils/format.js';

export default function Avatar({ name, gender, size = 'md' }) {
  return (
    <span className={`avatar avatar--${size} avatar--${gender}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
