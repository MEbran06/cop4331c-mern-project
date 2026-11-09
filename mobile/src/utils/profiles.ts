import { ApiRequest } from "@events/api";

export interface StudentProfile {
    id: string;
    name: string;
    email: string;
    //bio?: string;
}

export interface ClubProfile {
    id: string;
    name: string;
    email: string;
    description?:string
}

export interface Follower {
    id: string;
    name: string;
    followedAt: string; 
}

export async function fetchProfile(userId: string, api: ApiRequest): Promise<StudentProfile> {
    const res = await api<StudentProfile>(`users/${userId}`);
    if (!res.ok) throw new Error("Could not retrieve user profile");
    if (!res.data) throw new Error("No user profile data")
    return res.data;
}

export async function fetchClubProfile(userId: string, api: ApiRequest): Promise<ClubProfile> {
    const res = await api<ClubProfile>(`users/${userId}`);
    if (!res.ok) throw new Error("Could not retrieve user profile");
    if (!res.data) throw new Error("No club profile data")
    return res.data;
}

// One page of followers plus the total count, so the UI can show
// "FOLLOWERS · 48" without downloading all 48.
export interface FollowersPage {
    followers: Follower[];
    total: number;
}

const MOCK_NAMED: Follower[] = [
    { id: 's1', name: 'Maya Chen',       followedAt: '2026-10-28T14:12:00Z' },
    { id: 's2', name: 'Jordan Rivera',   followedAt: '2026-10-21T09:40:00Z' },
    { id: 's3', name: 'Priya Natarajan', followedAt: '2026-10-15T18:05:00Z' },
    { id: 's4', name: 'Sam Okafor',      followedAt: '2026-10-02T11:30:00Z' },
    { id: 's5', name: 'Alex Kim',        followedAt: '2026-09-19T16:45:00Z' },
];

// pad out to 48 followers, each one a day older than the last
const MOCK_FOLLOWERS: Follower[] = [
    ...MOCK_NAMED,
    ...Array.from({ length: 43 }, (_, i) => ({
        id: `s${i + 6}`,
        name: `Student ${i + 6}`,
        followedAt: new Date(Date.UTC(2026, 8, 18 - i, 12)).toISOString(),
    })),
].sort((a, b) => b.followedAt.localeCompare(a.followedAt)); // newest first

// Mocks GET /api/clubs/:clubId/followers?limit=&skip=
export async function fetchClubFollowers(
    clubId: string,
    api: ApiRequest,
    { limit = 20, skip = 0 }: { limit?: number; skip?: number } = {},
): Promise<FollowersPage> {
    // const res = await api<FollowersPage>(`clubs/${clubId}/followers?limit=${limit}&skip=${skip}`);
    // if (!res.ok || !res.data) throw new Error("Could not retrieve followers");
    // return res.data;

    await new Promise((resolve) => setTimeout(resolve, 300)); // fake network delay
    return {
        followers: MOCK_FOLLOWERS.slice(skip, skip + limit),
        total: MOCK_FOLLOWERS.length,
    };
}