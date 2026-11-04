import { StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/contexts/ctx';
import { PageContainer } from '@/components/PageContainer';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { fetchProfile, StudentProfile } from '@/utils/profiles';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { theme } from '@/app/preferences';
import { DotGrid, HardShadow } from '@/components/decor';
import { fonts, spacing } from '@/constants/theme';
import { ArrowButton } from '@/components/ThemedButton';
import { ProfileCard } from '@/components/ProfileCard';
import { SettingsRow } from '@/components/SettingsRow';

export default function FollowingPage() {
    const {session, user, signOut} = useSession();
    const [profile, SetProfile] = useState<StudentProfile>();
    const router = useRouter();

    useFocusEffect(useCallback(()=>{

        let active = true;

        if (!user || !session) 
            return ()=>{active=false;};

        // make call to api to fetch user profile
        fetchProfile(user.id, session).then((profile)=>{
            if (!active) return;
            SetProfile(profile);
        })

        return ()=>{active=false;};

    }, [user, session]));

    if (!profile) {
        return (
            <PageContainer>
                <ThemedDisplayTitle fontSize={48} theme={theme} text="profile not" highlight="found"/>
                <Text style={style.notFoundText}>
                    User profile not found.
                </Text>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                <ThemedDisplayTitle fontSize={48} highlightedFirst text='' theme={theme} highlight='Profile' inline/>
                <DotGrid/>
            </View>
            <ProfileCard theme={theme}
                name={profile.name}
                email={profile.email}
                style={{ marginTop: spacing.gap }}/>
            <Text style={style.sectionLabel}>settings</Text>
            <HardShadow color={theme.ink}>
                <View style={{ borderWidth: theme.borderWidth, borderColor: theme.ink }}>
                    <SettingsRow theme={theme} icon="sun"
                        title="Display & accessibility"
                        subtitle="Color theme, text size, fonts"
                        onPress={() => router.push('/preferences')}/>
                    <SettingsRow 
                        theme={theme} icon='lock'
                        title='Change password'
                        style={{ borderTopWidth: theme.borderWidth, borderTopColor: theme.ink }}
                        onPress={undefined}/>
                </View>
            </HardShadow>
            <View style={{marginTop:spacing.gap}}>
                <ArrowButton 
                    variant="plain" 
                    label='log out' theme={theme}
                    onPress={signOut}/>
            </View>
            


        </PageContainer>
    );
}

const style = StyleSheet.create({
     notFoundText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: 10
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
    }
});