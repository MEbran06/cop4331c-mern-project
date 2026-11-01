import { theme } from '@/app/preferences';
import { getInitials } from '@/components/clubRow';
import { PageContainer } from '@/components/PageContainer';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedBox } from '@/components/ThemedBox';
import { Club, ClubEvent, getEventStatus } from '@/utils/events';
import { getClubEvents, searchClubById } from '@/utils/mockEvents';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ButtonHeader } from '@/components/ButtonHeader';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { ArrowButton, FollowButton } from '@/components/ThemedButton';
import { fonts, spacing } from '@/constants/theme';
import { CornerSquares, DotGrid } from '@/components/decor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { handleSingleToggleFollow } from '@/utils/utils';
import { EventSection } from '@/components/EventSection';

const SECTIONS = [
    { title: 'Happening now', status: 'live',     sort: 'asc'  },
    { title: 'Just ended',    status: 'past',     sort: 'desc' },
    { title: 'Coming up',     status: 'upcoming', sort: 'asc'  },
] as const;

function eventsFor(status: string, sort: 'asc' | 'desc', events: ClubEvent[]): ClubEvent[] {
    // filter() returns a new array, so sorting it doesn't touch the original list
    return events
        .filter((event) => getEventStatus(event) === status)
        .sort((a, b) => {
            const diff = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
            return sort === 'asc' ? diff : -diff;
        });
}

export default function FollowingPage() {
    const { id } = useLocalSearchParams<{ id: string; }>();
    const router = useRouter();
    const [club, SetClub] = useState<Club>();
    const [events, SetEvents] = useState<ClubEvent[]>();
    const [isFollowing, SetIsFollowing] = useState<boolean>();
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
    

    useFocusEffect(useCallback(()=>{

            let active = true;

                // do the search
                searchClubById(id).then((club) => {
                    if (!active) return;
                    SetClub(club || undefined);
                    SetIsFollowing(club?club.isFollowing:false)
                    setLoading(false);
                });

                getClubEvents(id).then((events) => {
                    if (!active) return;
                    SetEvents(events)
                });

                

                return () => { active = false; };

        }, [id]));

    if (loading) {
        return (
            <PageContainer>
                <ActivityIndicator style={style.loading} color={theme.ink}/>
            </PageContainer>
        );
    }

    if (!club) {
        return (
            <PageContainer>
                <ButtonHeader onAction={goBack} theme={theme} buttonType="arrow-left"/>
                <View>
                    <View style={style.cornerSquare}/>
                    <ThemedDisplayTitle fontSize={48} theme={theme} text="club not" highlight="found"/>
                </View>
                <Text style={style.notFoundText}>
                    This club may have been removed, or the link you followed is out of date.
                </Text>
                <View style={style.notFoundButton}>
                    <ArrowButton theme={theme} label="go back" onPress={goBack}/>
                </View>
            </PageContainer>
        );
    }
    const followers = club.followers + (isFollowing === club.isFollowing ? 0 : isFollowing ? 1 : -1);

    return (
        <PageContainer fullBleed={true}>
            <ScrollableSection>
                <View style={{ backgroundColor: theme.hi, 
                paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 16,
                borderBottomWidth: theme.borderWidth, borderBottomColor: theme.ink }}>
                    <View style={{
                        flexDirection:"row", justifyContent:"space-between"
                    }}>
                        <ButtonHeader onAction={goBack} theme={theme} buttonType="arrow-left"/>
                        <DotGrid/>
                    </View>
                    <View style={{
                        alignItems: 'flex-end'
                    }}>
                        <CornerSquares/>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}>
                    <View style={{ alignItems: "flex-start", marginTop: -45 }}>
                        <ThemedBox color={theme.ink} text={getInitials(club.name)} size={90} theme={theme}/>
                    </View>
                    <View>
                        <ThemedDisplayTitle fontSize={48} theme={theme} text={club.name}/>
                        <Text style={style.meta}>
                            {followers} followers · {events ? (events.length === 1 ? '1 event' : `${events.length} events`) : 'no events'}
                        </Text>
                        {!!club.description &&
                        <Text style={style.description}>
                            {club.description}
                        </Text>}
                        <View style={style.followButton}>
                            <FollowButton onPress={()=>handleSingleToggleFollow(club, SetIsFollowing, isFollowing??false)} isFollowing={isFollowing??false} theme={theme}/>
                        </View>
                        {!!events && SECTIONS.map((section) => (
                            <EventSection key={section.status}
                                title={section.title}
                                events={eventsFor(section.status, section.sort, events)}
                                theme={theme}
                                onEventPress={(event) => router.push({ 
                                    pathname: "/(user_student)/event/[id]", params: {id: event.id}})}
                                
                                onTakeSurvey={(eventId)=>router.push({ 
                                        pathname: "/(user_student)/survey/[eventId]", 
                                        params: {eventId: eventId}})}/>
                        ))}
                    </View>
                </View>
            </ScrollableSection>
        </PageContainer>
    );
}
const style = StyleSheet.create({
    loading: {
        flex: 1
    },
    // small orange square to the right of the title, like the other headline screens
    cornerSquare: {
        position: 'absolute',
        top: spacing.gap + 8,
        right: 4,
        width: 22,
        height: 22,
        backgroundColor: theme.s3,
        borderWidth: 2,
        borderColor: theme.ink
    },
    // "12 followers · 3 events" under the club name
    meta: {
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted,
        marginTop: 4
    },
    description: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 22,
        color: theme.ink,
        marginTop: 12
    },
    followButton: {
        marginTop: spacing.gap
    },
    notFoundText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: 10
    },
    notFoundButton: {
        marginTop: spacing.gap
    }
});
