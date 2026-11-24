import { ApiRequest } from "@events/api";
import { Club, ClubEvent, ClubManagedEvent } from "./events";
import type { EventFormResult } from "@/components/EventForm";

interface ApiClub {
    _id: string,
    name: string,
    description?: string,
    followerCount: number,
    isFollowing: boolean
}

export interface EventsPage {
    events: ClubManagedEvent[];
    total: number;
}

export async function getFeed(api: ApiRequest): Promise<ClubEvent[]> {
    const res = await api<ClubEvent[]>(`events/feed`);
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No feed data")
    return res.data;
}


export async function getEvent(eventId:string, api: ApiRequest): Promise<ClubEvent> {
    const res = await api<ClubEvent>(`events/${eventId}`);
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No event data");
    return res.data;
}

export async function toggleFollow(clubId: string, api: ApiRequest): Promise<boolean> {
    const res = await api<{isFollowing: boolean}>(`clubs/${clubId}/follow`, {method:'POST'});
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No follow data");
    return res.data.isFollowing;
}

function toClub(club: ApiClub): Club {
    return {
        id: club._id,
        followers: club.followerCount,
        description: club.description,
        name: club.name,
        isFollowing: club.isFollowing
    };
}

export async function searchClubs(search:string, api: ApiRequest): Promise<Club[]> {
    const res = await api<{clubs: ApiClub[]}>(`clubs?q=${encodeURIComponent(search.trim())}`);
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No clubs data");
    const resAsClub = res.data.clubs.map(toClub);
    return resAsClub;
}

export async function getFollowedClubs(api: ApiRequest): Promise<Club[]> {
    const res = await api<{clubs: ApiClub[]}>("clubs?followedOnly=true");
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No followed clubs data");
    const resAsClub = res.data.clubs.map(toClub);
    return resAsClub;
}

export async function getClub(clubId:string, api: ApiRequest) : Promise<Club> {
    const res = await api<Club>(`clubs/${clubId}`);
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No club data");
    return res.data;
}

export async function getClubEvents(clubId: string, api: ApiRequest): Promise<ClubEvent[]> {
    const res = await api<ClubEvent[]>(`clubs/${clubId}/events`);
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No club events data")
    return res.data;
}

type ApiSurveyAnswer = {
    questionId: string;
    value: string | string[];
}[];

export async function submitSurveyResponse(eventId: string, answers: ApiSurveyAnswer, api: ApiRequest) : Promise<void> {
    const res = await api(`events/${eventId}/survey/responses`, {method: 'POST', body: {answers}})
    if (!res.ok) throw new Error(res.error);
}

export async function getClubManagedEvents(
    clubId: string,
    api: ApiRequest,
    { when, limit = 20, skip = 0 }: { when: 'upcoming' | 'past'; limit?: number; skip?: number },
): Promise<EventsPage>
{
    const res = await api<EventsPage>(`clubs/${clubId}/managed-events?when=${when}&limit=${limit}&skip=${skip}`);
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No club events data")
    return res.data;
}

export async function createEvent(event: EventFormResult, api: ApiRequest): Promise<ClubManagedEvent> {
    const res = await api<ClubManagedEvent>('events', {method:'POST', body:event})
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No event data");
    return res.data;
}

export async function getClubManagedEvent(eventId: string, api: ApiRequest): Promise<ClubManagedEvent> {
    const res = await api<ClubManagedEvent>(`events/${eventId}/manage`);
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No event data");
    return res.data;
}

export async function updateEvent(eventId: string, event: EventFormResult, api: ApiRequest): Promise<ClubManagedEvent> {
    const res = await api<ClubManagedEvent>(`events/${eventId}`, {method:'PATCH', body:event})
    if (!res.ok) throw new Error(res.error);
    if (!res.data) throw new Error("No event data");
    return res.data;
}

export async function deleteEvent(eventId: string, api: ApiRequest): Promise<void> {
    const res = await api(`events/${eventId}`, {method:'DELETE'});
    if (!res.ok) throw new Error(res.error);
}

