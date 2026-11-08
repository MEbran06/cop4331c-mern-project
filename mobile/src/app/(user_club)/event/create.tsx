import { ButtonHeader } from "@/components/ButtonHeader";
import { EventForm } from "@/components/EventForm";
import { PageContainer } from "@/components/PageContainer";
import { ThemedDisplayTitle } from "@/components/ThemedInputs";
import { fonts, Theme } from "@/constants/theme";
import { useSession } from "@/contexts/ctx";
import { useTheme } from "@/contexts/theme";
import { useApi } from "@/hooks/useApi";
import { ClubProfile, fetchClubProfile } from "@/utils/profiles";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";

export default function EventCreate() {
    const {theme} = useTheme();
    const router = useRouter();
    const {user} = useSession();
    const api = useApi();
    const [error, setError] = useState('');
    const [profile, SetProfile] = useState<ClubProfile>();
    const style = useMemo(()=>styleGen(theme), [theme]);

    useFocusEffect(useCallback(()=>{
        let active = true;

        if (!user)
            return ()=>{active=false;};

        // make call to api to fetch user profile
        fetchClubProfile(user.id, api).then((profile)=>{
            if (!active) return;
            SetProfile(profile);
        }).catch(() => { if (active) setError("User profile not found.") });

        return ()=>{active=false;};
    }, [user, api]));

    // no profile and no error means it's still loading
    if (!profile && !error) {
        return (
            <PageContainer>
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>
            </PageContainer>
        );
    }

    if (!profile) {
        return (
            <PageContainer>
                <ThemedDisplayTitle fontSize={48} theme={theme} text="profile not" highlight="found"/>
                <Text style={style.notFoundText}>
                    {error}
                </Text>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ButtonHeader buttonType="arrow-left" theme={theme} onAction={router.back}>
                <Text>{profile.name} · club</Text>
            </ButtonHeader>
            <EventForm
                theme={theme}
                heading="new"
                highlight="event"
                submitLabel="post event"
                onSubmit={async () => {
                    // TODO: POST the event, then router.back()
                }}/>
        </PageContainer>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    notFoundText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: 10
    }
});
