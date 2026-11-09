// src/utils/mockEvents.ts
// Sample events to build the feed before the backend exists.
// Dates are relative to "now", so there's always one live, some past and some upcoming event.
import { ApiRequest } from '@events/api';
import { Club, ClubEvent, ClubManagedEvent, SurveyResults } from './events';

const HOUR = 60 * 60 * 1000;

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * HOUR).toISOString();
}

// Each club is defined once; the events below point at these same objects,
// so a club's name, followers and isFollowing always match everywhere.
const clubs = {
  chess: {
    id: 'club-chess',
    name: 'Chess Club',
    followers: 112,
    isFollowing: true,
    description: 'Casual and rated play every week. All levels welcome, from first-timers to tournament regulars.',
  },
  film: {
    id: 'club-film',
    name: 'Film Society',
    followers: 48,
    isFollowing: true,
    description: 'Screenings, discussions and the occasional student short. Popcorn is always on us.',
  },
  outdoors: {
    id: 'club-outdoors',
    name: 'Outdoors Club',
    followers: 203,
    isFollowing: true,
    description: 'Hikes, camping trips and kayaking around campus and beyond. Gear available to borrow.',
  },
  music: {
    id: 'club-music',
    name: 'Music Collective',
    followers: 87,
    isFollowing: false,
    description: 'Open mics, jam sessions and karaoke nights for musicians and listeners alike.',
  },
  robotics: {
    id: 'club-robotics',
    name: 'Robotics Club',
    followers: 64,
    isFollowing: true,
    description: 'Build, code and compete. Hands-on workshops for beginners and a competition team.',
  },
  debate: {
    id: 'club-debate',
    name: 'Debate Society',
    followers: 31,
    isFollowing: false,
  },
  // clubs without events in MOCK_EVENTS, for testing lists that aren't tied to the feed
  photo: {
    id: 'club-photo',
    name: 'Photography Club',
    followers: 76,
    isFollowing: true,
    description: 'Photo walks, editing workshops and a yearly exhibition in the student union.',
  },
  boardGames: {
    id: 'club-board-games',
    name: 'Board Game Guild',
    followers: 1,
    isFollowing: false,
    description: 'Weekly game nights with a shelf of over 100 games. Bring a friend or make one.',
  },
} satisfies Record<string, Club>;

export const MOCK_CLUBS: Club[] = Object.values(clubs);

export const MOCK_EVENTS: ClubEvent[] = [
  {
    // live: started an hour ago, ends in an hour
    // survey open -> stays open until the club closes it -> shows the survey button
    id: 'evt-1',
    title: 'Blitz Night',
    club: clubs.chess,
    startsAt: hoursFromNow(-1),
    endsAt: hoursFromNow(1),
    location: 'Library, Room 104',
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
    club: clubs.film,
    startsAt: hoursFromNow(-20),
    endsAt: hoursFromNow(-17),
    location: 'Student Union Theater',
    description: 'Our October throwback screening. Free popcorn while it lasts, and bring a friend. Doors open 15 minutes before the film starts.',
    survey: {
      id: 'srv-1',
      title: 'How was Movie Night?',
      status: 'open',
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
    club: clubs.outdoors,
    startsAt: hoursFromNow(-5 * 24),
    endsAt: hoursFromNow(-5 * 24 + 4),
    location: 'North Trailhead',
    description: 'A 6 km loop timed to catch the sunrise from the ridge. Wear layers and bring water; we carpool from the main gate.',
    survey: {
      id: 'srv-2',
      title: 'Sunrise Hike feedback',
      status: 'open',
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
    // past, club closed the survey -> no button
    id: 'evt-4',
    title: 'Open Mic',
    club: clubs.music,
    startsAt: hoursFromNow(-9 * 24),
    endsAt: hoursFromNow(-9 * 24 + 3),
    location: 'Student Union Café',
    description: 'Sign up at the door for a 5-minute slot, or just come to listen. Sound system and a house guitar available.',
    survey: {
      id: 'srv-3',
      title: 'Open Mic feedback',
      status: 'closed',
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
    club: clubs.robotics,
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
    // past, club closed the survey -> no button
    id: 'evt-7',
    title: 'Karaoke Night',
    club: clubs.music,
    startsAt: hoursFromNow(-3 * 24),
    endsAt: hoursFromNow(-3 * 24 + 3),
    location: 'Student Union Café',
    description: 'Pick a song, grab the mic. Duets encouraged.',
    survey: {
      id: 'srv-6',
      title: 'Karaoke Night feedback',
      status: 'closed',
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
    club: clubs.debate,
    startsAt: hoursFromNow(4 * 24),
    endsAt: hoursFromNow(4 * 24 + 1.5),
  },
];


const MOCK_CLUB: Club = MOCK_CLUBS[0]

const MOCK_CLUB_EVENTS: ClubManagedEvent[] = [
    {
        // live: started an hour ago, ends in an hour
        id: 'evt-1',
        title: 'Blitz Night',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-1),
        endsAt: hoursFromNow(1),
        location: 'Library, Room 104',
        description: 'Drop in for fast-paced blitz games. Boards and clocks provided, so just bring yourself. Beginners welcome, we pair by rating.',
        survey: {
            id: 'srv-4',
            title: 'Blitz Night check-in',
            status: 'draft',
            questions: [
                {
                    id: 'q-4-1',
                    text: 'How are your games going?',
                    type: 'single_choice',
                    options: ['Winning streak', 'Mixed results', 'Rough night'],
                    required: true,
                },
            ],
            responseCount: 5,
        },
    },
    {
        // upcoming, no survey
        id: 'evt-2',
        title: 'Opening Theory',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(48),
        endsAt: hoursFromNow(50),
        location: 'Student Union, Room 210',
    },
    {
        // past, survey closed
        id: 'evt-3',
        title: 'Fall Tournament',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-74),
        endsAt: hoursFromNow(-70),
        location: 'Library, Room 104',
        survey: {
            id: 'srv-5',
            title: 'Fall Tournament feedback',
            status: 'closed',
            questions: [],
            responseCount: 27,
        },
    },
    {
        // past, survey still open
        id: 'evt-4',
        title: 'Endgame Workshop',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-26),
        endsAt: hoursFromNow(-24),
        location: 'Library, Room 104',
        survey: {
            id: 'srv-6',
            title: 'Endgame Workshop feedback',
            status: 'open',
            questions: [],
            responseCount: 1,
        },
    },
    {
        // past, survey never published
        id: 'evt-5',
        title: 'Puzzle Rush',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-170),
        endsAt: hoursFromNow(-168),
        location: 'Student Union, Room 210',
        survey: {
            id: 'srv-7',
            title: 'Puzzle Rush feedback',
            status: 'draft',
            questions: [],
            responseCount: 0,
        },
    },
    {
        // past, no survey
        id: 'evt-6',
        title: 'Beginner Night',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-340),
        endsAt: hoursFromNow(-338),
        location: 'Library, Room 104',
    },
];

// Results by event id. Only published surveys are here, because drafts have no results.
const MOCK_SURVEY_RESULTS: Record<string, SurveyResults> = {
    'evt-3': {
        // closed, with an optional multiple choice and written answers
        id: 'srv-5',
        title: 'Fall Tournament feedback',
        status: 'closed',
        responseCount: 27,
        questions: [
            {
                questionId: 'q-5-1',
                text: 'How was the tournament overall?',
                type: 'single_choice',
                answeredCount: 27,
                options: [
                    { label: 'Great', count: 14 },
                    { label: 'Good', count: 9 },
                    { label: 'Okay', count: 3 },
                    { label: 'Poor', count: 1 },
                ],
            },
            {
                questionId: 'q-5-2',
                text: 'What did you like?',
                type: 'multiple_choice',
                answeredCount: 22,
                options: [
                    { label: 'Pairings', count: 12 },
                    { label: 'Prizes', count: 15 },
                    { label: 'Venue', count: 7 },
                    { label: 'Snacks', count: 10 },
                ],
            },
            {
                questionId: 'q-5-3',
                text: 'What should we change next time?',
                type: 'text',
                answeredCount: 4,
                answers: [
                    'Longer breaks between rounds.',
                    'More tables, it got crowded near the end.',
                    'Post the pairings online.',
                    'Please keep the snacks!',
                ],
            },
        ],
    },
    'evt-4': {
        // open, with one response and a written question nobody answered
        id: 'srv-6',
        title: 'Endgame Workshop feedback',
        status: 'open',
        responseCount: 1,
        questions: [
            {
                questionId: 'q-6-1',
                text: 'Was the workshop at the right level?',
                type: 'single_choice',
                answeredCount: 1,
                options: [
                    { label: 'Too easy', count: 0 },
                    { label: 'Just right', count: 1 },
                    { label: 'Too hard', count: 0 },
                ],
            },
            {
                questionId: 'q-6-2',
                text: 'Any topics for next time?',
                type: 'text',
                answeredCount: 0,
                answers: [],
            },
        ],
    },
};


// ---------------------------------------------------------------------------
// Mock API: stands in for the backend until the real endpoints exist.
// MOCK_CLUBS plays the part of the database, so changes made here show up
// the next time a screen "fetches". Replace these with real requests later.

// GET followed clubs. Returns copies, like a real response would, so screens
// can't accidentally change the "database" by editing what they received.
export async function fetchFollowedClubs(): Promise<Club[]> {
  return MOCK_CLUBS.filter((club) => club.isFollowing).map((club) => ({ ...club }));
}

// POST / DELETE follow. Saves the change right away, like the real request will.
export async function setClubFollowing(clubId: string, following: boolean): Promise<void> {
  const club = MOCK_CLUBS.find((c) => c.id === clubId);
  if (!club || club.isFollowing === following) return;
  club.isFollowing = following;
  club.followers += following ? 1 : -1;
}

export async function searchClubs(search: string): Promise<Club[]> {
    return MOCK_CLUBS.filter(club=>club.name.toLowerCase().includes(search.trim())).map((club) => ({ ...club }))
}

export async function searchClubById(id: string): Promise<Club|void> {
    const found = MOCK_CLUBS.find(club=>club.id===id)
    if (found)
        return {...found}
    else
        return;
}

export async function getClubEvents(clubId: string): Promise<ClubEvent[]> {
    return MOCK_EVENTS.filter(event=>event.club.id===clubId).map((event) => ({ ...event }))
}

export interface EventsPage {
    events: ClubManagedEvent[];
    total: number;
}

export async function getClubManagedEvents(
    clubId: string,
    api: ApiRequest,
    { when, limit = 20, skip = 0 }: { when: 'upcoming' | 'past'; limit?: number; skip?: number },
): Promise<EventsPage>  {

    const now = new Date();

    const matching = MOCK_CLUB_EVENTS.filter((event) => {
        const isPast = new Date(event.endsAt) < now;
        return when === 'past' ? isPast : !isPast;
    });

    const time = (event: ClubManagedEvent) => new Date(event.startsAt).getTime();

    const sorted = matching.sort((a, b) =>
        when === 'past'
            ? time(b) - time(a)   // newest first
            : time(a) - time(b)   // soonest first
    );



    await new Promise((resolve) => setTimeout(resolve, 300)); // fake network delay
    return {
        events:sorted.slice(skip, skip + limit),
        total: matching.length,
    };
}

export async function getClubManagedEvent(eventId: string, api: ApiRequest) : Promise<ClubManagedEvent>{
    const found = MOCK_CLUB_EVENTS.find((event)=>event.id===eventId)
    if (!found) throw new Error("Event not found");
    return { ...found };

}

export async function getSurveyResults(eventId: string, api: ApiRequest): Promise<SurveyResults> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // fake network delay

    const found = MOCK_SURVEY_RESULTS[eventId];
    if (!found) throw new Error("Survey results not found");
    return { ...found };
}
