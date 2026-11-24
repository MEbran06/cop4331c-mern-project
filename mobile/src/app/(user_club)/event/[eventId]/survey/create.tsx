import { ButtonHeader } from "@/components/ButtonHeader";
import { PageContainer } from "@/components/PageContainer";
import { SurveyForm } from "@/components/SurveyForm";
import { useTheme } from "@/contexts/theme";
import { useApi } from "@/hooks/useApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";
import { createSurvey } from "@/utils/api";

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
                onSaveDraft={async (survey) => {await createSurvey(eventId, "draft", survey, api); router.back();}}
                onPublish={async (survey) => {await createSurvey(eventId, "open", survey, api); router.back();}}/>
        </PageContainer>
    );
}
