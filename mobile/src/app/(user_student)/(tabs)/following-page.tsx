import { theme } from '@/app/preferences';
import { ClubRow } from '@/components/clubRow';
import { PageContainer } from '@/components/PageContainer';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedDisplayTitle, ThemedInputContainer, ThemedSearchInput } from '@/components/ThemedInputs';
import { Club } from '@/utils/events';
import { fetchFollowedClubs, searchClubs, setClubFollowing } from '@/utils/mockEvents';
import { useFocusEffect, useRouter } from 'expo-router';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DotGrid, HardShadow } from '@/components/decor';
import { fonts, spacing } from '@/constants/theme';

async function handleToggleFollow(club: Club, followed: string[],
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

export default function FollowingPage() {
    const [followed, setFollowed] = useState<string[]>([]);
    const [followedClubs, setFollowedClubs] = useState<Club[]>([]);
    const [searchResults, setSearchResults] = useState<Club[]>([]);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const isSearching = !!search.trim();
    const visibleClubs = isSearching ? searchResults : followedClubs;
    const label = `${isSearching ? 'results' : 'following'} · ${visibleClubs.length}`;

    useFocusEffect(
        useCallback(()=>{
            let active = true; 

            // runs every time the tab comes into view, 
            // so unfollowed clubs are gone on the next visit
            fetchFollowedClubs().then((clubs) => {
                if (!active) return;
                setFollowedClubs(clubs);
                setFollowed(clubs.map(club => club.id));
            });

            return () => { active = false; setSearch('')};
        }, [])
    );

    useEffect(()=>{

        let active = true; 

            // do the search
            searchClubs(search).then((clubs) => {
                if (!active) return;
                setSearchResults(clubs);
            });

            return () => { active = false; };

    }, [search]);

  return (
    <PageContainer>
        <View>
            {/* orange square with a dot grid under it, to the right of the title */}
            <View style={style.decor}>
                <View style={style.cornerSquare}/>
                <DotGrid color={theme.ink} width={40} height={32}/>
            </View>
            <ThemedDisplayTitle fontSize={48} text='your' highlight='clubs' theme={theme}/>
        </View>
        <ThemedInputContainer theme={theme} label="search clubs" style={style.search}>
            <HardShadow color={theme.ink} offset={4}>
                <ThemedSearchInput theme={theme} placeholder="Name of a club" value={search} onChangeText={setSearch} />
            </HardShadow>
        </ThemedInputContainer>
        <ScrollableSection>
            <Text style={style.sectionLabel}>{label}</Text>
            {visibleClubs.length > 0 ? (
                // one box for the whole list; rows drop their own border and use a line between them
                <HardShadow color={theme.ink} style={style.listShadow}>
                    <View style={style.list}>
                        {visibleClubs.map((club, index) => (
                            <ClubRow key={club.id} theme={theme} clubInfo={club}
                                isFollowing={followed.includes(club.id)}
                                onFollowButtonPress={()=>handleToggleFollow(club, followed, setFollowed)}
                                style={[style.row, index > 0 && style.rowDivider]}
                                onBoxPress={()=>router.push({
                                    pathname: '/(user_student)/(club)/[id]',
                                    params: {id: club.id}
                                })}/>
                        ))}
                    </View>
                </HardShadow>
            ) : (
                <Text style={style.emptyText}>
                    {isSearching
                        ? `No clubs match "${search.trim()}".`
                        : "You're not following any clubs yet. Search above to find some."}
                </Text>
            )}
        </ScrollableSection>
    </PageContainer>
  );
}

const style = StyleSheet.create({
    decor: {
        position: 'absolute',
        top: spacing.gap,
        right: 0,
        alignItems: 'flex-end',
        gap: 14
    },
    cornerSquare: {
        width: 24,
        height: 24,
        backgroundColor: theme.s3,
        borderWidth: 2,
        borderColor: theme.ink
    },
    search: {
        marginTop: spacing.gap
    },
    sectionLabel: {
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted,
        marginTop: spacing.gap,
        marginBottom: 8
    },
    listShadow: {
        marginBottom: 40 // room above the tab bar at the end of the scroll
    },
    list: {
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    row: {
        borderWidth: 0
    },
    rowDivider: {
        borderTopWidth: theme.borderWidth,
        borderTopColor: theme.ink
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted
    }
});
