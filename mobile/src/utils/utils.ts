import { Dispatch, SetStateAction } from "react";
import { Club } from "./events";
import { setClubFollowing } from "./mockEvents";


export async function handleToggleFollow(club: Club, followed: string[],
        setFollowed: Dispatch<SetStateAction<string[]>>) {
    const follow = !followed.includes(club.id);

    // update the button right away
    setFollowed((prevItems: string[]) =>
        follow ? [...prevItems, club.id] : prevItems.filter((clubId) => clubId !== club.id)
    );

    try {
        await setClubFollowing(club.id, follow);
    } catch {
        // the request failed: put the button back the way it was
        setFollowed((prevItems: string[]) =>
            follow ? prevItems.filter((clubId) => clubId !== club.id) : [...prevItems, club.id]
        );
    }
}

export async function handleSingleToggleFollow(club: Club,setter: (val: boolean)=>void, isFollowing: boolean) {
    setter(!isFollowing);

     try {
        await setClubFollowing(club.id, !isFollowing);
    } catch {
        // the request failed: put the button back the way it was
        setter(isFollowing);
    }
}