import { ButtonHeader } from "@/components/ButtonHeader";
import { PageContainer } from "@/components/PageContainer";
import { ThemedDisplayTitle } from "@/components/ThemedInputs";
import { ScrollableSection } from "@/components/ScrollableSection";
import { ChoiceResultCard, TextResultCard } from "@/components/SurveyResultCard";
import { ThemedButton } from "@/components/ThemedButton";
import { fonts, spacing, Theme } from "@/constants/theme";
import { useTheme } from "@/contexts/theme";
import { useApi } from "@/hooks/useApi";
import { SurveyResults } from "@/utils/events";
import { getSurveyResults } from "@/utils/mockEvents";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";


export default function SurveyResultsPage() {
    const {theme} = useTheme();
    const style = useMemo(()=>styleGen(theme), [theme]);
    const router = useRouter();
    const {eventId} = useLocalSearchParams<{eventId: string}>();
    const api = useApi();
    const [results, setResults] = useState<SurveyResults>();
    const [error, setError] = useState<string>();

    useFocusEffect(useCallback(()=>{
        let active = true;

        getSurveyResults(eventId, api).then((results)=>{
            if (!active) return;
            setResults(results);
            setError(undefined);
        }).catch(() => {if (active) setError("could not load results")});

        return ()=>{active=false;};
    },[eventId, api]));

    function confirmClose() {
        Alert.alert(
            "Close this survey?",
            "Students won't be able to respond anymore. This can't be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Close survey",
                    style: "destructive",
                    onPress: () => {
                        // TODO: close the survey, then update results so the status changes
                    },
                },
            ],
        );
    }

    return (
        <PageContainer>
            <ButtonHeader buttonType="arrow-left" theme={theme} onAction={router.back}>
                <Text>results</Text>
            </ButtonHeader>
            <ThemedDisplayTitle fontSize={50} highlight="survey" text="results" highlightedFirst inline theme={theme} />
            {!!results && (
                <View style={style.statusRow}>
                    <View style={style.statusBadge}>
                        {results.status === "open" && <View style={style.statusDot}/>}
                        <Text style={style.statusText}>
                            {results.status} · {results.responseCount} {results.responseCount === 1 ? "response" : "responses"}
                        </Text>
                    </View>
                    {results.status === "open" && (
                        <ThemedButton theme={theme} variant="plain" shadowOffset={3} onPress={confirmClose} accessibilityLabel="Close survey">
                            <Text style={style.closeText}>close survey</Text>
                        </ThemedButton>
                    )}
                </View>
            )}
            {!!error && (
                <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: theme.muted, marginTop: 10 }}>{error}</Text>
            )}

            {!results && !error && <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>}
            {results?.responseCount === 0 && <Text style={style.emptyText}>No responses yet</Text>}
            {!!results && results.responseCount > 0 && (
                <ScrollableSection>
                    <View style={style.questionList}>
                        {results.questions.map((question, index) => (
                            question.type === "text" ? (
                                <TextResultCard key={question.questionId} theme={theme} index={index} question={question}/>
                            ) : (
                                <ChoiceResultCard key={question.questionId} theme={theme} index={index} question={question}/>
                            )
                        ))}
                    </View>
                </ScrollableSection>
            )}
            
        </PageContainer>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    emptyText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: spacing.gap
    },
    questionList: {
        gap: 18,
        marginTop: spacing.gap
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginTop: spacing.gap
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1, // a long count wraps instead of pushing the button off the screen
        gap: 8,
        backgroundColor: theme.ink,
        paddingHorizontal: 10,
        paddingVertical: 6
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.card
    },
    statusText: {
        flexShrink: 1,
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.card
    },
    closeText: {
        fontFamily: fonts.label,
        fontSize: 15,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink,
        paddingHorizontal: 16,
        paddingVertical: 12
    }
});