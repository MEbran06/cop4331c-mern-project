export interface StudentProfile {
    id: string;
    name: string;
    email: string;
    //bio?: string;
}

export async function fetchProfile(userId: string, token: string): Promise<StudentProfile> {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Could not retrieve user profile");
    return res.json();
}
