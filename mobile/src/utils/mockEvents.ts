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
    club: { id: 'club-chess', name: 'Chess Club', followers: 112, isFollowing: true },
    startsAt: hoursFromNow(-1),
    endsAt: hoursFromNow(1),
    location: 'Library, Room 104',
    subtitle: '5-minute games, all skill levels',
    description: 'Drop in for fast-paced blitz games. Boards and clocks provided, so just bring yourself. Beginners welcome, we pair by rating.',
  },
  {
    // ended last night, survey open and not answered yet -> shows the survey button
    id: 'evt-2',
    title: 'Movie Night',
    club: { id: 'club-film', name: 'Film Society', followers: 48, isFollowing: true },
    startsAt: hoursFromNow(-20),
    endsAt: hoursFromNow(-17),
    location: 'Student Union Theater',
    subtitle: 'Screening: Back to the Future (1985)',
    description: 'Our October throwback screening. Free popcorn while it lasts, and bring a friend. Doors open 15 minutes before the film starts.',
    survey: { id: 'srv-1', estimatedMinutes: 2, questionCount: 3, closesAt: hoursFromNow(48), completed: false },
  },
  {
    // past, survey already answered -> no button
    id: 'evt-3',
    title: 'Sunrise Hike',
    club: { id: 'club-outdoors', name: 'Outdoors Club', followers: 203, isFollowing: true },
    startsAt: hoursFromNow(-5 * 24),
    endsAt: hoursFromNow(-5 * 24 + 4),
    location: 'North Trailhead',
    description: 'A 6 km loop timed to catch the sunrise from the ridge. Wear layers and bring water; we carpool from the main gate.',
    survey: { id: 'srv-2', estimatedMinutes: 3, questionCount: 5, closesAt: hoursFromNow(24), completed: true },
  },
  {
    // past, survey closed -> no button
    id: 'evt-4',
    title: 'Open Mic',
    club: { id: 'club-music', name: 'Music Collective', followers: 87, isFollowing: false },
    startsAt: hoursFromNow(-9 * 24),
    endsAt: hoursFromNow(-9 * 24 + 3),
    location: 'Student Union Café',
    subtitle: 'Music, poetry and comedy',
    description: 'Sign up at the door for a 5-minute slot, or just come to listen. Sound system and a house guitar available.',
    survey: { id: 'srv-3', estimatedMinutes: 5, questionCount: 8, closesAt: hoursFromNow(-2 * 24), completed: false },
  },
  {
    // upcoming, in two days
    id: 'evt-5',
    title: 'Robot Build Workshop',
    club: { id: 'club-robotics', name: 'Robotics Club', followers: 64, isFollowing: true },
    startsAt: hoursFromNow(2 * 24),
    endsAt: hoursFromNow(2 * 24 + 2),
    location: 'Engineering Lab 3',
    description: 'Hands-on session building a line-following robot. No experience needed; kits are provided for the first 20 people.',
  },
  {
    // upcoming, no location, subtitle or description -> details page should handle the missing fields
    id: 'evt-6',
    title: 'Debate Practice',
    club: { id: 'club-debate', name: 'Debate Society', followers: 31, isFollowing: false },
    startsAt: hoursFromNow(4 * 24),
    endsAt: hoursFromNow(4 * 24 + 1.5),
  },
];
