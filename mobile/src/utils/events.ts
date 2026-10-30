import { MOCK_EVENTS } from "./mockEvents";

// Matches surveyQuestionSchema in backend/db_schema.js
export type SurveyQuestionType = 'text' | 'single_choice' | 'multiple_choice';

export type SurveyStatusType = 'draft' | 'open' | 'closed'

export interface SurveyQuestion {
  id: string;
  text: string;
  type: SurveyQuestionType;
  options: string[];        // empty for 'text' questions
  required: boolean;
}

export interface EventSurvey {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  closesAt?: string;         // when the survey stops accepting answers
  status: SurveyStatusType;
  completed: boolean;       // whether the user already answered
}

export interface ClubEvent {
    id: string;
    title: string;
    club: { id: string; name: string, 
            followers: number, isFollowing: boolean };
    startsAt: string;        
    endsAt: string;          
    location?: string;        
    survey?: EventSurvey;  
    subtitle ?: string;
    description ?: string; 
}

export type EventStatus = 'live' | 'upcoming' | 'past';

// Worked out on the device from the timestamps
export function getEventStatus(event: ClubEvent, now: Date = new Date()): EventStatus {
  if (now < new Date(event.startsAt)) return 'upcoming';
  if (now > new Date(event.endsAt)) return 'past';
  return 'live';
}

export function isSurveyAvailable(event: ClubEvent, now: Date = new Date()): boolean {
  return !!event.survey && 
        !event.survey.completed && 
        (!event.survey.closesAt || now < new Date(event.survey.closesAt)) && 
        event.survey.status === 'open';
}

export function formatDate(iso: string) {

    const date = new Date(iso);
    const month = date.toLocaleDateString('en-US', { month: 'short' })    
    const day = date.toLocaleDateString('en-US', { day: 'numeric' })    
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
    
    return {month, day, weekday};
}


// "Thu, Oct 22"
export function formatLongDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// "7:00 - 9:30 PM", or "11:00 AM - 1:00 PM" when the event crosses noon/midnight
export function formatTimeRange(startIso: string, endIso: string) {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    const start = new Date(startIso).toLocaleTimeString('en-US', options);
    const end = new Date(endIso).toLocaleTimeString('en-US', options);
    // splits "7:00 PM" into "7:00" and "PM"; \s also matches the narrow space some devices put before AM/PM
    const startParts = start.match(/^(.+?)\s*([AP]M)$/i);
    const endParts = end.match(/^(.+?)\s*([AP]M)$/i);
    if (startParts && endParts && startParts[2] === endParts[2]) {
        return `${startParts[1]} - ${end}`;
    }
    return `${start} - ${end}`;
}

export function formatEnded(endIso: string, now: Date = new Date()) {
    const end = new Date(endIso);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    if (end >= startOfToday) return 'Ended today';
    if (end >= startOfYesterday) return 'Ended yesterday';
    return `Ended ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function getEventFromId(id: string) : ClubEvent | undefined {
    return MOCK_EVENTS.find(event => event.id === id);
}

// The backend doesn't store a time estimate, so work one out from the questions:
// about 20 seconds per choice question and a minute per written answer.
export function estimateSurveyMinutes(survey: EventSurvey): number {
    const seconds = survey.questions.reduce((total, q) => total + (q.type === 'text' ? 60 : 20), 0);
    return Math.max(1, Math.round(seconds / 60));
}
