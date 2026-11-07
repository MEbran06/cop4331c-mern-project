import { StyleSheet, Text, View } from 'react-native';
import { PageContainer } from '@/components/PageContainer';
import { ScrollableSection } from '@/components/ScrollableSection';
import { useTheme } from '@/contexts/theme';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { DotGrid, HardShadow } from '@/components/decor';
import { fonts, spacing, Theme } from '@/constants/theme';
import { useMemo } from 'react';
import { CreateButton } from '@/components/ThemedButton';
import { useRouter } from 'expo-router';
import { ClubPastEventRow, ClubUpcomingEventCard } from '@/components/ClubEventCard';
import { Club, ClubManagedEvent, getEventStatus } from '@/utils/events';


const HOUR = 60 * 60 * 1000;

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * HOUR).toISOString();
}

const MOCK_CLUB: Club = {
    id: 'club-chess',
    name: 'Chess Club',
    followers: 112,
    isFollowing: true,
    description: 'Casual and rated play every week. All levels welcome, from first-timers to tournament regulars.',
};

const MOCK_EVENTS: ClubManagedEvent[] = [
    {
        // live: started an hour ago, ends in an hour
        id: 'evt-1',
        title: 'Blitz Night',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-1),
        endsAt: hoursFromNow(1),
        location: 'Library, Room 104',
        subtitle: '5-minute games, all skill levels',
        description: 'Drop in for fast-paced blitz games. Boards and clocks provided, so just bring yourself. Beginners welcome, we pair by rating.',
        survey: {
            id: 'srv-4',
            title: 'Blitz Night check-in',
            status: 'draft',
            questions: [
                {
                    id: 'q-4-1',
                    text: 'How are your games going?',
                    type: 'single_choice',
                    options: ['Winning streak', 'Mixed results', 'Rough night'],
                    required: true,
                },
            ],
            responseCount: 5,
        },
    },
    {
        // upcoming, no survey
        id: 'evt-2',
        title: 'Opening Theory',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(48),
        endsAt: hoursFromNow(50),
        location: 'Student Union, Room 210',
    },
    {
        // past, survey closed
        id: 'evt-3',
        title: 'Fall Tournament',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-74),
        endsAt: hoursFromNow(-70),
        location: 'Library, Room 104',
        survey: {
            id: 'srv-5',
            title: 'Fall Tournament feedback',
            status: 'closed',
            questions: [],
            responseCount: 27,
        },
    },
    {
        // past, survey still open
        id: 'evt-4',
        title: 'Endgame Workshop',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-26),
        endsAt: hoursFromNow(-24),
        location: 'Library, Room 104',
        survey: {
            id: 'srv-6',
            title: 'Endgame Workshop feedback',
            status: 'open',
            questions: [],
            responseCount: 1,
        },
    },
    {
        // past, survey never published
        id: 'evt-5',
        title: 'Puzzle Rush',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-170),
        endsAt: hoursFromNow(-168),
        location: 'Student Union, Room 210',
        survey: {
            id: 'srv-7',
            title: 'Puzzle Rush feedback',
            status: 'draft',
            questions: [],
            responseCount: 0,
        },
    },
    {
        // past, no survey
        id: 'evt-6',
        title: 'Beginner Night',
        club: MOCK_CLUB,
        startsAt: hoursFromNow(-340),
        endsAt: hoursFromNow(-338),
        location: 'Library, Room 104',
    },
];

function startTime(event: ClubManagedEvent): number {
    return new Date(event.startsAt).getTime();
}

export default function Index() {
  const {theme} = useTheme();
  const style = useMemo(()=>styleGen(theme), [theme]);
  const router = useRouter();

  // Live events stay in the upcoming section. filter() returns a new array, so sorting it doesn't touch the mocks.
  const upcomingEvents = MOCK_EVENTS
    .filter((event) => getEventStatus(event) !== 'past')
    .sort((a, b) => startTime(a) - startTime(b)); // soonest first
  const pastEvents = MOCK_EVENTS
    .filter((event) => getEventStatus(event) === 'past')
    .sort((a, b) => startTime(b) - startTime(a)); // newest first

  return (
    <PageContainer>
        <View style={style.headerContainer}>
            <ThemedDisplayTitle fontSize={48} inline theme={theme} text='your' highlight='events'/>
            <DotGrid color={theme.ink}/>
        </View>

        <View style={{marginTop: spacing.gap}}>
            <CreateButton theme={theme} onPress={()=>null} label='event'/>
        </View>

        <ScrollableSection>
            {upcomingEvents.length > 0 && (
                <View style={style.section}>
                    <Text style={style.heading}>Upcoming</Text>
                    {upcomingEvents.map((event) => (
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
                </View>
            )}

            {pastEvents.length > 0 && (
                <View style={style.section}>
                    <Text style={style.heading}>Past</Text>
                    <HardShadow>
                        <View style={style.pastList}>
                            {pastEvents.map((event, index) => (
                                <ClubPastEventRow
                                    key={event.id}
                                    theme={theme}
                                    event={event}
                                    style={index > 0 && style.pastDivider}/>
                            ))}
                        </View>
                    </HardShadow>
                </View>
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
    }
});
