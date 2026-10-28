// src/utils/mockEvents.ts
// Sample events to build the feed before the backend exists.
// Dates are relative to "now", so there's always one live, some past and some upcoming event.
import { ClubEvent } from './events';

const HOUR = 60 * 60 * 1000;

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * HOUR).toISOString();
}

export const MOCK_EVENTS: ClubEvent[] = [
  {
    // live: started an hour ago, ends in an hour
    id: 'evt-1',
    title: 'Blitz Night',
    club: { id: 'club-chess', name: 'Chess Club' },
    startsAt: hoursFromNow(-1),
    endsAt: hoursFromNow(1),
    location: 'Library, Room 104',
  },
  {
    // ended last night, survey open and not answered yet -> shows the survey button
    id: 'evt-2',
    title: 'Movie Night: Back to the Future',
    club: { id: 'club-film', name: 'Film Society' },
    startsAt: hoursFromNow(-20),
    endsAt: hoursFromNow(-17),
    location: 'Auditorium B',
    survey: { id: 'srv-1', estimatedMinutes: 2, closesAt: hoursFromNow(48), completed: false },
  },
  {
    // past, survey already answered -> no button
    id: 'evt-3',
    title: 'Sunrise Hike',
    club: { id: 'club-outdoors', name: 'Outdoors Club' },
    startsAt: hoursFromNow(-5 * 24),
    endsAt: hoursFromNow(-5 * 24 + 4),
    location: 'North Trailhead',
    survey: { id: 'srv-2', estimatedMinutes: 3, closesAt: hoursFromNow(24), completed: true },
  },
  {
    // past, survey closed -> no button
    id: 'evt-4',
    title: 'Open Mic',
    club: { id: 'club-music', name: 'Music Collective' },
    startsAt: hoursFromNow(-9 * 24),
    endsAt: hoursFromNow(-9 * 24 + 3),
    location: 'Student Union Café',
    survey: { id: 'srv-3', estimatedMinutes: 5, closesAt: hoursFromNow(-2 * 24), completed: false },
  },
  {
    // upcoming, in two days
    id: 'evt-5',
    title: 'Robot Build Workshop',
    club: { id: 'club-robotics', name: 'Robotics Club' },
    startsAt: hoursFromNow(2 * 24),
    endsAt: hoursFromNow(2 * 24 + 2),
    location: 'Engineering Lab 3',
  },
  {
    // upcoming, no location (online / TBA) -> card should handle the missing field
    id: 'evt-6',
    title: 'Debate Practice',
    club: { id: 'club-debate', name: 'Debate Society' },
    startsAt: hoursFromNow(4 * 24),
    endsAt: hoursFromNow(4 * 24 + 1.5),
  },
];
