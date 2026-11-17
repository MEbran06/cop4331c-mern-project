import { Dispatch, SetStateAction } from "react";
import { Club } from "./events";
import { ApiRequest } from "@events/api";
import { toggleFollow } from "./api";


export async function handleToggleFollow(club: Club, followed: string[],
        setFollowed: Dispatch<SetStateAction<string[]>>,
        api: ApiRequest) {
    const follow = !followed.includes(club.id);

    // update the button right away
    setFollowed((prevItems: string[]) =>
        follow ? [...prevItems, club.id] : prevItems.filter((clubId) => clubId !== club.id)
    );

    try {
        const isFollowing = await toggleFollow(club.id, api);
        setFollowed((prevItems) => {
            const without = prevItems.filter((clubId) => clubId !== club.id);
            return isFollowing ? [...without, club.id] : without;
        });

    } catch {
        // the request failed: put the button back the way it was
        setFollowed((prevItems: string[]) =>
            follow ? prevItems.filter((clubId) => clubId !== club.id) : [...prevItems, club.id]
        );
    }
}

export async function handleSingleToggleFollow(club: Club, api: ApiRequest, setter: (val: boolean)=>void, isFollowing: boolean) {
    setter(!isFollowing);

     try {
        const follow = await toggleFollow(club.id, api);
        setter(follow);
    } catch {
        // the request failed: put the button back the way it was
        setter(isFollowing);
    }
}