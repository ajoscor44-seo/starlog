// Every way an order or transaction can end without succeeding. These are
// shown to customers as a single "FAILED" status.
const UNSUCCESSFUL_STATUSES = new Set([
  'FAILED', 'FAILURE', 'FAIL', 'ERROR',
  'CANCELLED', 'CANCELED', 'EXPIRED', 'TIMEOUT', 'TIMED OUT',
  'REFUNDED', 'REJECTED', 'DECLINED', 'REVERSED',
]);

export const isUnsuccessfulStatus = (status) =>
  UNSUCCESSFUL_STATUSES.has(String(status || '').trim().toUpperCase());

export const displayStatus = (status) => (isUnsuccessfulStatus(status) ? 'FAILED' : status);
