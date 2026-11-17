import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PageContainer } from '@/components/PageContainer';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/theme';
import { CheckerStrip, DotGrid } from '@/components/decor';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { fonts, spacing, Theme } from '@/constants/theme';
import { useState, useMemo, useCallback } from 'react';
import { FilterChip } from '@/components/ThemedButton';
import { EventSection } from '@/components/EventSection';
import { ClubEvent, EventStatus, getEventStatus } from '@/utils/events';
import { getFeed } from '@/utils/api';
import { useApi } from '@/hooks/useApi';

type Filter = 'all' | 'upcoming' | 'past';

// Order here is the order on screen. 'asc' = soonest first, 'desc' = most recent first.
const SECTIONS = [
    { title: 'Happening now', status: 'live',     sort: 'asc'  },
    { title: 'Just ended',    status: 'past',     sort: 'desc' },
    { title: 'Coming up',     status: 'upcoming', sort: 'asc'  },
] as const;

// Which sections each filter chip shows
const FILTER_SECTIONS: Record<Filter, EventStatus[]> = {
    all: ['live', 'past', 'upcoming'],
    upcoming: ['live', 'upcoming'],
    past: ['past'],
};

function eventsFor(events: ClubEvent[], status: EventStatus, sort: 'asc' | 'desc'): ClubEvent[] {
    // filter() returns a new array, so sorting it doesn't touch the original list
    return events
        .filter((event) => getEventStatus(event) === status)
        .sort((a, b) => {
            const diff = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
            return sort === 'asc' ? diff : -diff;
        });
}


export default function Dashboard() {
  const { theme } = useTheme();
  const style = useMemo(() => styleGen(theme), [theme]);
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string>();
  const [events, setEvents] = useState<ClubEvent[]>();
  const [count, setCount] = useState<number>();
  const api = useApi();

  useFocusEffect(useCallback(()=>{
        let active = true;

        getFeed(api).then((events) => {
            if (!active) return;
            setEvents(events);
            setCount(new Set(events.map(e => e.club.id)).size);
            setError(undefined);
        }).catch((error)=>{if (active) setError(error.message)})

        return ()=>{active=false}
  },[api]));

  return (
    <PageContainer>
        <DotGrid color={theme.ink} />
        <ThemedDisplayTitle fontSize={40} theme={theme} text="what's on" highlight='this week' inline={true}/>
        {error ? (
            <Text style={style.emptyText}>{error}</Text>
        ) : !events ?    
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>
        :
        <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.gap }}>
            <CheckerStrip columns={8} ink={theme.ink} background={theme.card} />
            <View style={style.clubTag}>
                <Text style={style.customText}>
                    {count === 1?"1 club": `${count} clubs`} · {events.length} events
                </Text>
            </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.gap, marginBottom: 5 }}>
            <FilterChip label="All"      selected={filter === 'all'}      onPress={() => setFilter('all')}      theme={theme} />
            <FilterChip label="Upcoming" selected={filter === 'upcoming'} onPress={() => setFilter('upcoming')} theme={theme} />
            <FilterChip label="Past"     selected={filter === 'past'}     onPress={() => setFilter('past')}     theme={theme} />
        </View>

        {events.length === 0 ? (
            <Text style={style.emptyText}>No events yet. Follow some clubs to see what they're up to.</Text>
        ) :
        (<ScrollableSection>
            {SECTIONS
                .filter((section) => FILTER_SECTIONS[filter].includes(section.status))
                .map((section) => (
                    <EventSection key={section.status}
                        title={section.title}
                        events={eventsFor(events, section.status, section.sort)}
                        theme={theme}
                        onEventPress={(event) => router.push({ 
                            pathname: "/(user_student)/event/[id]", params: {id: event.id}})}
                        
                        onTakeSurvey={(eventId)=>router.push({ 
                                pathname: "/(user_student)/survey/[eventId]", 
                                params: {eventId: eventId}})}/>
                ))}
        </ScrollableSection>
        )}
        </>
        }
    </PageContainer>
  );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    clubTag: {
        backgroundColor: theme.hi,
        borderWidth: 3,
        borderColor: theme.ink,
        padding: 3
    },
    customText: {
        fontFamily: fonts.label,
        color: theme.ink,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontSize: 12
    },
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: spacing.gap
    },

});