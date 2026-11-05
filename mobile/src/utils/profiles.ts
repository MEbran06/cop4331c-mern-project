import { ApiRequest } from "@events/api";

export interface StudentProfile {
    id: string;
    name: string;
    email: string;
    //bio?: string;
}

export async function fetchProfile(userId: string, api: ApiRequest): Promise<StudentProfile> {
    const res = await api<StudentProfile>(`users/${userId}`);
    if (!res.ok) throw new Error("Could not retrieve user profile");
    if (!res.data) throw new Error("No user profile data")
    return res.data;
}