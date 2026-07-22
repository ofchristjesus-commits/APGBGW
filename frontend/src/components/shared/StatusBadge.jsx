import { getStatusColor } from '../../lib/portUtils';

export default function StatusBadge({ status }) {
  const colors = getStatusColor(status);
  return (
    <span className={`badge ${colors}`}>
      {status}
    </span>
  );
}
