import { describe, it, expect } from 'vitest';
import { generateICS, toICalDate } from '@/lib/ics';

describe('ICS', () => {
  it('formats UTC iCal date', () => {
    const d = new Date(Date.UTC(2024, 0, 2, 3, 4, 5));
    expect(toICalDate(d)).toBe('20240102T030405Z');
  });

  it('generates a calendar with events', () => {
    const start = new Date(Date.UTC(2024, 0, 2, 10, 0, 0));
    const end = new Date(Date.UTC(2024, 0, 2, 10, 30, 0));
    const ics = generateICS([
      { start, end, title: 'Showing 1: 123 Main', description: 'Test', location: '123 Main' },
    ]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Showing 1: 123 Main');
    expect(ics).toContain('DTSTART:20240102T100000Z');
    expect(ics).toContain('DTEND:20240102T103000Z');
  });
});

