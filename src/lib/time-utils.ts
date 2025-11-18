export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString('en-US', {
    hour12: true,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}
