// Minimal ICS generator for a tour. No external lib to keep zero-keys footprint.
// Times are formatted in UTC as DTSTART/DTEND with Z suffix.

function pad(n: number, w = 2) {
  return n.toString().padStart(w, '0');
}

export function toICalDate(date: Date): string {
  const d = new Date(date);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

export type IcsEvent = {
  uid?: string;
  start: Date;
  end: Date;
  title: string;
  description?: string;
  location?: string;
};

export function generateICS(events: IcsEvent[], prodId = '-//noah-buyer-studio//EN'): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  const now = toICalDate(new Date());
  for (const ev of events) {
    const uid = ev.uid || `${Math.random().toString(36).slice(2)}@noah-buyer-studio`; // basic uid
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${toICalDate(ev.start)}`);
    lines.push(`DTEND:${toICalDate(ev.end)}`);
    lines.push(`SUMMARY:${escapeText(ev.title)}`);
    if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeText(s: string) {
  // Escape RFC5545 characters: comma, semicolon, backslash, newline
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

