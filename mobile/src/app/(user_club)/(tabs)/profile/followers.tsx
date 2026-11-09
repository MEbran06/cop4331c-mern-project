import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/theme';
import { useSession } from '@/contexts/ctx';
import { useApi } from '@/hooks/useApi';
import { fonts } from '@/constants/theme';
import { PageContainer } from '@/components/PageContainer';
import { ButtonHeader } from '@/components/ButtonHeader';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { FollowerRow } from '@/components/FollowerRow';
import { fetchClubFollowers, Follower } from '@/utils/profiles';

export default function FollowersPage() {
    const { theme } = useTheme();
    const { user } = useSession();
    const api = useApi();
    const router = useRouter();
    const [followers, setFollowers] = useState<Follower[]>();

    useFocusEffect(useCallback(() => {
        let active = true;
        if (!user) return () => { active = false; };

        // TODO: load page by page with onEndReached once the list gets long
        fetchClubFollowers(user.id, api, { limit: 100 }).then((page) => {
            if (active) setFollowers(page.followers);
        }).catch(() => { if (active) setFollowers([]); });

        return () => { active = false; };
    }, [user, api]));

    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}/>
            <ThemedDisplayTitle fontSize={48} theme={theme} text='followers'/>

            {!followers ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>
            ) : (
                <FlatList
                    data={followers}
                    keyExtractor={(follower) => follower.id}
                    showsVerticalScrollIndicator={false}
                    style={{ marginTop: 10 }}
                    contentContainerStyle={{ borderWidth: theme.borderWidth, borderColor: theme.ink, marginBottom: 20 }}
                    renderItem={({ item, index }) => (
                        <FollowerRow theme={theme} follower={item} index={index}
                            style={index > 0 && { borderTopWidth: theme.borderWidth, borderTopColor: theme.ink }}/>
                    )}
                    ListEmptyComponent={
                        <Text style={{ fontFamily: fonts.body, color: theme.muted, padding: 14 }}>
                            No followers yet.
                        </Text>
                    }
                />
            )}
        </PageContainer>
    );
}
