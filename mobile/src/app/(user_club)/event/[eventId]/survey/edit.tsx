import { ButtonHeader } from "@/components/ButtonHeader";
import { PageContainer } from "@/components/PageContainer";
import { SurveyForm, SurveyFormResult } from "@/components/SurveyForm";
import { fonts } from "@/constants/theme";
import { useTheme } from "@/contexts/theme";
import { useApi } from "@/hooks/useApi";
import { ClubSurvey } from "@/utils/events";
import { getClubManagedEvent } from "@/utils/mockEvents";
import { ApiRequest } from "@events/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";

async function updateSurvey(eventId: string, status: "draft" | "open", survey: SurveyFormResult, api: ApiRequest) {
    // TODO: PATCH the existing survey with its status
}

export default function SurveyEdit() {
    const {theme} = useTheme();
    const router = useRouter();
    const api = useApi();
    const {eventId} = useLocalSearchParams<{ eventId: string }>();
    const [survey, setSurvey] = useState<ClubSurvey>();
    const [error, setError] = useState('');

    useEffect(()=>{
        let active = true;

        getClubManagedEvent(eventId, api).then((event)=>{
            if (!active) return;
            // only edit drafts
            if (event.survey?.status === "draft") setSurvey(event.survey);
            else setError("This survey can't be edited.");
        }).catch(() => { if (active) setError("Survey not found.") });

        return ()=>{active=false;};
    }, [eventId, api]);

    return (
        <PageContainer>
            <ButtonHeader buttonType="arrow-left" theme={theme} onAction={router.back}>
                <Text>survey</Text>
            </ButtonHeader>
            {error ? (
                <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: theme.muted, marginTop: 10 }}>{error}</Text>
            ) : !survey ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>
            ) : (
                <SurveyForm
                    theme={theme}
                    heading="edit"
                    initialValues={{ title: survey.title, questions: survey.questions }}
                    onSaveDraft={(updated) => updateSurvey(eventId, "draft", updated, api)}
                    onPublish={(updated) => updateSurvey(eventId, "open", updated, api)}/>
            )}
        </PageContainer>
    );
}
