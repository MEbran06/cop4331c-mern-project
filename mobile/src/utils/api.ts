import { ApiRequest } from "@events/api";
import { Club, ClubEvent } from "./events";

interface ApiClub {
    _id: string,
    name: string,
    description?: string,
    followerCount: number,
    isFollowing: boolean
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
    if (!res.data) throw new Error("No event data")
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