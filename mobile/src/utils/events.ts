export interface EventSurvey {
  id: string;
  estimatedMinutes: number; 
  closesAt: string;        
  completed: boolean;   
}

export interface ClubEvent {
  id: string;
  title: string;
  club: { id: string; name: string };
  startsAt: string;        
  endsAt: string;          
  location?: string;        
  survey?: EventSurvey;     
}

export type EventStatus = 'live' | 'upcoming' | 'past';

// Worked out on the device from the timestamps
export function getEventStatus(event: ClubEvent, now: Date = new Date()): EventStatus {
  if (now < new Date(event.startsAt)) return 'upcoming';
  if (now > new Date(event.endsAt)) return 'past';
  return 'live';
}

export function isSurveyAvailable(event: ClubEvent, now: Date = new Date()): boolean {
  return !!event.survey && !event.survey.completed && now < new Date(event.survey.closesAt);
}

export function formatDate(iso: string) {

    const date = new Date(iso);
    const month = date.toLocaleDateString('en-US', { month: 'short' })    
    const day = date.toLocaleDateString('en-US', { day: 'numeric' })    
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
    
    return {month, day, weekday};
}


export function formatTimeRange(startIso: string, endIso: string) {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
    const start = new Date(startIso).toLocaleTimeString('en-US', options);
    const end = new Date(endIso).toLocaleTimeString('en-US', options);
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
