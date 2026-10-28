import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/contexts/ctx';
import { PageContainer } from '@/components/PageContainer';
import { ButtonHeader } from '@/components/ButtonHeader';
import { useRouter } from 'expo-router';
import { theme } from '../preferences';
import { CheckerStrip, DotGrid } from '@/components/decor';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { fonts, spacing, Theme } from '@/constants/theme';
import { useMemo, useState } from 'react';
import { FilterChip } from '@/components/ThemedButton';

// for testing
import { MOCK_EVENTS } from '@/utils/mockEvents';
import { EventSection } from '@/components/EventSection';
import { ClubEvent, EventStatus, getEventStatus } from '@/utils/events';

const events = MOCK_EVENTS;

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

function eventsFor(status: EventStatus, sort: 'asc' | 'desc'): ClubEvent[] {
    // filter() returns a new array, so sorting it doesn't touch the original list
    return events
        .filter((event) => getEventStatus(event) === status)
        .sort((a, b) => {
            const diff = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
            return sort === 'asc' ? diff : -diff;
        });
}


export default function Dashboard() {
  const { signOut } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const style = useMemo(() => stylesGen(theme), [theme]);
  return (
    <PageContainer>
        <ButtonHeader onAction={() => null}
             buttonType='notification' theme={theme}
             buttonOnLeft={false}
             style={{marginBottom:0}}>
            <DotGrid color={theme.ink} />
        </ButtonHeader>
        <ThemedDisplayTitle fontSize={35} theme={theme} text="what's on" highlight='this week' inline={true}/>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.gap }}>
            <CheckerStrip columns={8} ink={theme.ink} background={theme.card} />
            <View style={style.clubTag}>
                <Text style={style.customText}>4 clubs · 5 events</Text>
            </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.gap, marginBottom: 5 }}>
            <FilterChip label="All"      selected={filter === 'all'}      onPress={() => setFilter('all')}      theme={theme} />
            <FilterChip label="Upcoming" selected={filter === 'upcoming'} onPress={() => setFilter('upcoming')} theme={theme} />
            <FilterChip label="Past"     selected={filter === 'past'}     onPress={() => setFilter('past')}     theme={theme} />
        </View>

        <ScrollableSection>
            {SECTIONS
                .filter((section) => FILTER_SECTIONS[filter].includes(section.status))
                .map((section) => (
                    <EventSection key={section.status}
                        title={section.title}
                        events={eventsFor(section.status, section.sort)}
                        theme={theme}
                        onEventPress={() => {}}/>
                ))}
        </ScrollableSection>
    </PageContainer>
  );
}

const stylesGen = (theme: Theme) => StyleSheet.create({
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
    }
});