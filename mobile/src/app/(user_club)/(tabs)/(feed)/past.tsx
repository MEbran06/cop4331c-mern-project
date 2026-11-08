import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/theme';
import { useSession } from '@/contexts/ctx';
import { useApi } from '@/hooks/useApi';
import { fonts } from '@/constants/theme';
import { PageContainer } from '@/components/PageContainer';
import { ButtonHeader } from '@/components/ButtonHeader';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { ClubPastEventRow } from '@/components/ClubEventCard';
import { ClubManagedEvent } from '@/utils/events';
import { getClubManagedEvents } from '@/utils/mockEvents';

const PAGE_SIZE = 20;

export default function PastEventsPage() {
    const { theme } = useTheme();
    const { user } = useSession();
    const api = useApi();
    const router = useRouter();
    const [events, setEvents] = useState<ClubManagedEvent[]>(); // undefined until the first page arrives
    const [total, setTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    // blocks double requests better than state.
    const isFetching = useRef(false);

    useEffect(() => {
        let active = true;
        if (!user) return () => { active = false; };

        getClubManagedEvents(user.id, api, { when: 'past', limit: PAGE_SIZE })
            .then((page) => {
                if (!active) return;
                setEvents(page.events);
                setTotal(page.total);
            })
            .catch(() => {
                if (!active) return;
                setEvents([]);
                setError('Could not load your past events.');
            });

        return () => { active = false; };
    }, [user, api]);

    // Next page, when the user scrolls near the bottom
    const loadMore = useCallback(() => {
        if (!user || !events || events.length >= total || isFetching.current) return;

        isFetching.current = true;
        setLoadingMore(true);
        getClubManagedEvents(user.id, api, { when: 'past', limit: PAGE_SIZE, skip: events.length })
            .then((page) => {
                setEvents((current) => [...(current ?? []), ...page.events]);
                setTotal(page.total);
            })
            .catch(() => setError('Could not load more events.'))
            .finally(() => {
                isFetching.current = false;
                setLoadingMore(false);
            });
    }, [user, api, events, total]);

    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}/>
            <ThemedDisplayTitle fontSize={48} theme={theme} text='past events'/>

            {!events ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(event) => event.id}
                    showsVerticalScrollIndicator={false}
                    style={{ marginTop: 10 }}
                    contentContainerStyle={{ borderWidth: theme.borderWidth, borderColor: theme.ink, marginBottom: 20 }}
                    renderItem={({ item, index }) => (
                        <ClubPastEventRow theme={theme} event={item}
                            style={index > 0 && { borderTopWidth: theme.borderWidth, borderTopColor: theme.ink }}/>
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5} // start loading when half a screen from the bottom
                    ListFooterComponent={
                        loadingMore ? <ActivityIndicator style={{ padding: 14 }} color={theme.ink}/>
                        : error && events.length > 0 ? (
                            <Text style={{ fontFamily: fonts.body, color: theme.muted, padding: 14 }}>{error}</Text>
                        ) : undefined
                    }
                    ListEmptyComponent={
                        <Text style={{ fontFamily: fonts.body, color: theme.muted, padding: 14 }}>
                            {error || 'No past events yet.'}
                        </Text>
                    }
                />
            )}
        </PageContainer>
    );
}
