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
    // survey open with no closesAt -> stays open until the club closes it -> shows the survey button
    id: 'evt-1',
    title: 'Blitz Night',
    club: { id: 'club-chess', name: 'Chess Club', followers: 112, isFollowing: true },
    startsAt: hoursFromNow(-1),
    endsAt: hoursFromNow(1),
    location: 'Library, Room 104',
    subtitle: '5-minute games, all skill levels',
    description: 'Drop in for fast-paced blitz games. Boards and clocks provided, so just bring yourself. Beginners welcome, we pair by rating.',
    survey: {
      id: 'srv-4',
      title: 'Blitz Night check-in',
      status: 'open',
      completed: false,
      questions: [
        {
          id: 'q-4-1',
          text: 'How are your games going?',
          type: 'single_choice',
          options: ['Winning streak', 'Mixed results', 'Rough night'],
          required: true,
        },
      ],
    },
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
    survey: {
      id: 'srv-1',
      title: 'How was Movie Night?',
      status: 'open',
      closesAt: hoursFromNow(48),
      completed: false,
      questions: [
        {
          id: 'q-1-1',
          text: 'How would you rate the screening?',
          type: 'single_choice',
          options: ['Loved it', 'Liked it', 'It was okay', 'Not for me'],
          required: true,
        },
        {
          id: 'q-1-2',
          text: 'What should we screen next?',
          type: 'multiple_choice',
          options: ['Classic comedies', 'Sci-fi', 'Horror', 'Animated', 'Documentaries'],
          required: false,
        },
        {
          id: 'q-1-3',
          text: 'Anything we could do better?',
          type: 'text',
          options: [],
          required: false,
        },
      ],
    },
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
    survey: {
      id: 'srv-2',
      title: 'Sunrise Hike feedback',
      status: 'open',
      closesAt: hoursFromNow(24),
      completed: true,
      questions: [
        {
          id: 'q-2-1',
          text: 'How hard was the hike?',
          type: 'single_choice',
          options: ['Too easy', 'Just right', 'Too hard'],
          required: true,
        },
        {
          id: 'q-2-2',
          text: 'Which trips would you join next?',
          type: 'multiple_choice',
          options: ['Kayaking', 'Camping weekend', 'Rock climbing', 'Night hike'],
          required: false,
        },
      ],
    },
  },
  {
    // past, survey closed automatically when closesAt passed -> no button
    id: 'evt-4',
    title: 'Open Mic',
    club: { id: 'club-music', name: 'Music Collective', followers: 87, isFollowing: false },
    startsAt: hoursFromNow(-9 * 24),
    endsAt: hoursFromNow(-9 * 24 + 3),
    location: 'Student Union Café',
    subtitle: 'Music, poetry and comedy',
    description: 'Sign up at the door for a 5-minute slot, or just come to listen. Sound system and a house guitar available.',
    survey: {
      id: 'srv-3',
      title: 'Open Mic feedback',
      status: 'closed',
      closesAt: hoursFromNow(-2 * 24),
      completed: false,
      questions: [
        {
          id: 'q-3-1',
          text: 'Did you perform or watch?',
          type: 'single_choice',
          options: ['Performed', 'Watched', 'Both'],
          required: true,
        },
        {
          id: 'q-3-2',
          text: 'What would you like to see at the next one?',
          type: 'text',
          options: [],
          required: false,
        },
      ],
    },
  },
  {
    // upcoming, in two days
    // survey still a draft -> no button. The real API shouldn't send drafts to students at all;
    // this is here to check the app hides one if it ever does.
    id: 'evt-5',
    title: 'Robot Build Workshop',
    club: { id: 'club-robotics', name: 'Robotics Club', followers: 64, isFollowing: true },
    startsAt: hoursFromNow(2 * 24),
    endsAt: hoursFromNow(2 * 24 + 2),
    location: 'Engineering Lab 3',
    description: 'Hands-on session building a line-following robot. No experience needed; kits are provided for the first 20 people.',
    survey: {
      id: 'srv-5',
      title: 'Workshop feedback',
      status: 'draft',
      completed: false,
      questions: [
        {
          id: 'q-5-1',
          text: 'Did your robot follow the line?',
          type: 'single_choice',
          options: ['Yes', 'Mostly', 'No'],
          required: true,
        },
      ],
    },
  },
  {
    // past, club closed the survey early (closesAt is still in the future) -> no button
    id: 'evt-7',
    title: 'Karaoke Night',
    club: { id: 'club-music', name: 'Music Collective', followers: 87, isFollowing: false },
    startsAt: hoursFromNow(-3 * 24),
    endsAt: hoursFromNow(-3 * 24 + 3),
    location: 'Student Union Café',
    description: 'Pick a song, grab the mic. Duets encouraged.',
    survey: {
      id: 'srv-6',
      title: 'Karaoke Night feedback',
      status: 'closed',
      closesAt: hoursFromNow(4 * 24),
      completed: false,
      questions: [
        {
          id: 'q-6-1',
          text: 'Would you come to another karaoke night?',
          type: 'single_choice',
          options: ['Definitely', 'Maybe', 'No'],
          required: true,
        },
      ],
    },
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
