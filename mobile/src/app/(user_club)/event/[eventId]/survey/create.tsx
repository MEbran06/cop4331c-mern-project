import { ButtonHeader } from "@/components/ButtonHeader";
import { PageContainer } from "@/components/PageContainer";
import { SurveyForm, SurveyFormResult } from "@/components/SurveyForm";
import { useTheme } from "@/contexts/theme";
import { useApi } from "@/hooks/useApi";
import { ApiRequest } from "@events/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";

async function createSurvey(eventId: string, status: "draft" | "open", survey: SurveyFormResult, api: ApiRequest) {
    // TODO: POST the survey with its status
}

export default function SurveyCreate() {
    const {theme} = useTheme();
    const router = useRouter();
    const api = useApi();
    const {eventId} = useLocalSearchParams<{ eventId: string }>();

    return (
        <PageContainer>
            <ButtonHeader buttonType="arrow-left" theme={theme} onAction={router.back}>
                <Text>survey</Text>
            </ButtonHeader>
            <SurveyForm
                theme={theme}
                heading="create"
                onSaveDraft={(survey) => createSurvey(eventId, "draft", survey, api)}
                onPublish={(survey) => createSurvey(eventId, "open", survey, api)}/>
        </PageContainer>
    );
}
