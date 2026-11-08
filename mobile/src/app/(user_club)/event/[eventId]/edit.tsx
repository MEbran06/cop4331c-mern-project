import { ButtonHeader } from "@/components/ButtonHeader";
import { EventForm } from "@/components/EventForm";
import { PageContainer } from "@/components/PageContainer";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedDisplayTitle } from "@/components/ThemedInputs";
import { fonts, spacing, Theme } from "@/constants/theme";
import { useSession } from "@/contexts/ctx";
import { useTheme } from "@/contexts/theme";
import { useApi } from "@/hooks/useApi";
import { ClubManagedEvent } from "@/utils/events";
import { getClubManagedEvent } from "@/utils/mockEvents";
import { ClubProfile, fetchClubProfile } from "@/utils/profiles";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

export default function EventEdit() {
    const {theme} = useTheme();
    const router = useRouter();
    const {user} = useSession();
    const api = useApi();
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const [error, setError] = useState('');
    const [eventError, setEventError] = useState('');
    const [profile, SetProfile] = useState<ClubProfile>();
    const [event, setEvent] = useState<ClubManagedEvent>();
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

    // useEffect, not useFocusEffect: reloading on focus would replace what the user has typed
    useEffect(()=>{
        let active = true;

        getClubManagedEvent(eventId, api).then((event)=>{
            if (active) setEvent(event);
        }).catch(() => { if (active) setEventError("Event not found.") });

        return ()=>{active=false;};
    }, [eventId, api]);

    function confirmDelete(responseCount: number) {
        const responses = `${responseCount} survey ${responseCount === 1 ? "response" : "responses"}`;
        Alert.alert(
            "Delete this event?",
            responseCount > 0 ? `This also removes its ${responses}. This can't be undone.` : "This can't be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        // TODO: DELETE the event, then router.back()
                    },
                },
            ],
        );
    }

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
            {eventError ? (
                <Text style={style.notFoundText}>{eventError}</Text>
            ) : !event ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>
            ) : (
                <EventForm
                    theme={theme}
                    heading="edit"
                    highlight="event"
                    submitLabel="save changes"
                    initialValues={{
                        title: event.title,
                        date: new Date(event.startsAt),
                        startTime: new Date(event.startsAt),
                        endTime: new Date(event.endsAt),
                        location: event.location,
                        description: event.description,
                    }}
                    onSubmit={async () => {
                        // TODO: PATCH the event, then router.back()
                    }}
                    footer={
                        <View style={style.deleteButton}>
                            <ThemedButton
                                theme={theme}
                                variant="plain"
                                accessibilityLabel="delete event"
                                onPress={() => confirmDelete(event.survey?.responseCount ?? 0)}
                                style={style.deleteButtonBox}>
                                <Text style={style.deleteText}>delete event</Text>
                            </ThemedButton>
                        </View>
                    }/>
            )}
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
    },
    deleteButton: {
        marginTop: spacing.gap * 2,
        marginBottom: spacing.gap
    },
    deleteButtonBox: {
        minHeight: spacing.buttonHeight,
        alignItems: "center",
        justifyContent: "center"
    },
    deleteText: {
        fontFamily: fonts.label,
        fontSize: 18,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: theme.primaryText
    }
});
