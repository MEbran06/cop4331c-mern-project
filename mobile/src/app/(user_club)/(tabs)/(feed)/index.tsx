import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PageContainer } from '@/components/PageContainer';
import { ScrollableSection } from '@/components/ScrollableSection';
import { useTheme } from '@/contexts/theme';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { DotGrid, HardShadow } from '@/components/decor';
import { fonts, spacing, Theme } from '@/constants/theme';
import { useCallback, useMemo, useState } from 'react';
import { CreateButton } from '@/components/ThemedButton';
import { useFocusEffect, useRouter } from 'expo-router';
import { ClubPastEventRow, ClubUpcomingEventCard, SeeAllRow } from '@/components/ClubEventCard';
import { ClubManagedEvent, getEventStatus } from '@/utils/events';
import { getClubManagedEvents } from '@/utils/mockEvents';
import { useSession } from '@/contexts/ctx';
import { useApi } from '@/hooks/useApi';

function startTime(event: ClubManagedEvent): number {
    return new Date(event.startsAt).getTime();
}

export default function Index() {
  const {theme} = useTheme();
  const style = useMemo(()=>styleGen(theme), [theme]);
  const router = useRouter();
  const {user} = useSession();
  const api = useApi();
  const [upcoming, setUpcoming] = useState<ClubManagedEvent[]>([]);
  const [past, setPast] = useState<ClubManagedEvent[]>([]);
  const [error, setError] = useState('');
  const [pastTotal, setPastTotal] = useState(0);
  const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(()=>{
        let active = true;

        if (!user)
            return ()=>{active=false};

        Promise.all([
            getClubManagedEvents(user.id, api, { when: 'upcoming' }),
            getClubManagedEvents(user.id, api, { when: 'past', limit: 5 }),
        ]).then(([upcomingPage, pastPage]) => {
            if (!active) return;
            setUpcoming(upcomingPage.events);
            setPast(pastPage.events);
            setPastTotal(pastPage.total);
        }).catch(()=>{if (active) setError("could not load your events")})
          .finally(()=>{if (active) setLoading(false);});

        return ()=>{active=false;}

    },[user, api]));

  return (
    <PageContainer>
        <View style={style.headerContainer}>
            <ThemedDisplayTitle fontSize={48} inline theme={theme} text='your' highlight='events'/>
            <DotGrid color={theme.ink}/>
        </View>

        <View style={{marginVertical: spacing.gap}}>
            <CreateButton theme={theme} onPress={()=>router.push("/(user_club)/event/create")} label='event'/>
        </View>

        <ScrollableSection>
            {loading ? ( 
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink} />
            ) :(
            <>
            <View style={style.section}>
                <Text style={style.heading}>Upcoming</Text>
                
                {upcoming.length === 0 ? (
                    <Text style={style.emptyText}>No upcoming events</Text>
                ):(
                    <>
                    {upcoming.map((event) => (
                    <ClubUpcomingEventCard
                        key={event.id}
                        theme={theme} event={event}
                        onEditClick={()=>router.push({
                            pathname: "/(user_club)/event/[eventId]/edit",
                            params: {
                                eventId: event.id
                            }
                        })}/>
                    ))}
                    </>
                )}


            </View>

            <View style={style.section}>
                <Text style={style.heading}>Past</Text>
                {past.length === 0 ? (
                     <Text style={style.emptyText}>No past events</Text>
                ) : (
                <HardShadow>
                    <View style={style.pastList}>
                        {past.map((event, index) => (
                            <ClubPastEventRow
                                key={event.id}
                                theme={theme}
                                event={event}
                                style={index > 0 && style.pastDivider}/>
                        ))}
                        {pastTotal > past.length && (
                            <SeeAllRow
                                theme={theme}
                                label="see all past events"
                                style={style.pastDivider}
                                onPress={()=>router.push("/(user_club)/(tabs)/(feed)/past")}/>
                        )}
                    </View>
                </HardShadow>)}
            </View>
            </>
        )}
        </ScrollableSection>
    </PageContainer>
  );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    section: {
        marginTop: spacing.gap,
        gap: 10
    },
    heading: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.muted
    },
    pastList: {
        borderWidth: theme.borderWidth,
        borderColor: theme.ink
    },
    pastDivider: {
        borderTopWidth: theme.borderWidth,
        borderTopColor: theme.ink
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: theme.muted
    },

});
