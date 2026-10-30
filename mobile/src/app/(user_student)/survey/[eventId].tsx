import { PageContainer } from "@/components/PageContainer";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { estimateSurveyMinutes, formatLongDate, getEventFromId, isSurveyAvailable } from "@/utils/events";
import { ButtonHeader } from "@/components/ButtonHeader";
import { theme } from "@/app/preferences";
import { fonts, spacing } from "@/constants/theme";
import { ScrollableSection } from "@/components/ScrollableSection";
import { ThemedDisplayTitle } from "@/components/ThemedInputs";
import { ArrowButton } from "@/components/ThemedButton";
import { useState } from "react";
import { isQuestionAnswered, QuestionCard, SurveyAnswer } from "@/components/QuestionCard";
import { ThemedBox } from "@/components/ThemedBox";
import { StripeBand } from "@/components/decor";


async function handleSubmitSurvey(surveyId: string, answers: Record<string, SurveyAnswer>, onSubmitted: () => void) {
    // await the API call
    onSubmitted();
}


export default function Survey() {
    
    const { eventId } = useLocalSearchParams<{ eventId: string; }>();
    const event = getEventFromId(eventId);
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>({});
    const canSubmit = event?.survey?.questions
    .filter((question) => question.required)
    .every((question) => isQuestionAnswered(answers[question.id]));

    const [submitted, setSubmitted] = useState(false);


    if (!event) {
        return (
            <PageContainer>
                <ButtonHeader onAction={router.back} theme={theme} buttonType="arrow-left"/>
                <ThemedDisplayTitle fontSize={48} theme={theme} text="event not" highlight="found"/>
                <Text style={style.notFoundText}>
                    Event not found or doesn't exist.
                </Text>
                <View style={{ marginTop: spacing.gap }}>
                    <ArrowButton theme={theme} label="back to feed" onPress={() => router.replace('/')}/>
                </View>
            </PageContainer>
        );
    }

    if (!event.survey) {
        return (
            <PageContainer>
                <ButtonHeader onAction={router.back} theme={theme} buttonType="arrow-left"/>
                <ThemedDisplayTitle fontSize={48} theme={theme} text="survey not" highlight="found"/>
                <Text style={style.notFoundText}>
                    Survey not found or doesn't exists.
                </Text>
                <View style={{ marginTop: spacing.gap }}>
                    <ArrowButton theme={theme} label="back to feed" onPress={() => router.replace('/')}/>
                </View>
            </PageContainer>
        );
    }

    if (submitted) {
        return (
            <PageContainer>
                <ButtonHeader onAction={() => router.replace('/')} theme={theme} buttonType="arrow-left" style={style.header}>
                    <Text style={style.headerLabel} numberOfLines={1}>survey · {event.club.name}</Text>
                </ButtonHeader>
                <View style={style.thanksContent}>
                    <ThemedBox icon="check" size={90} theme={theme}/>
                    <Text style={style.thanksTitle}>thanks!</Text>
                    <Text style={style.thanksText}>
                        Your feedback went to {event.club.name}. It helps them plan the next one.
                    </Text>
                    <View style={style.thanksButton}>
                        {/* closes the survey and the event page, back to the tabs */}
                        <ArrowButton theme={theme} label="back to feed" onPress={() => router.dismissAll()}/>
                    </View>
                </View>
                <StripeBand ink={theme.ink} background={theme.card} style={style.stripes}/>
            </PageContainer>
        );
    }

    if (!isSurveyAvailable(event)) {
        return (
            <PageContainer>
                <ButtonHeader onAction={router.back} theme={theme} buttonType="arrow-left"/>
                <ThemedDisplayTitle fontSize={48} theme={theme} text="survey not" highlight="found"/>
                <Text style={style.notFoundText}>
                    Survey is not available. It either closed or is already completed.
                </Text>
                <View style={{ marginTop: spacing.gap }}>
                    <ArrowButton theme={theme} label="back to feed" onPress={() => router.replace('/')}/>
                </View>
            </PageContainer>
        );
    }


    const questionCount = event.survey.questions.length;
    const minutes = estimateSurveyMinutes(event.survey);
    // first required question still unanswered, for the hint under the button
    const firstMissing = event.survey.questions
        .findIndex((question) => question.required && !isQuestionAnswered(answers[question.id]));

    return (
        <PageContainer>
            <ButtonHeader onAction={router.back} theme={theme} buttonType="arrow-left" style={style.header}>
                <Text style={style.headerLabel} numberOfLines={1}>survey · {event.club.name}</Text>
            </ButtonHeader>
            <ScrollableSection>
                <View>
                    <View style={style.cornerSquare}/>
                    <ThemedDisplayTitle fontSize={48} text="how was" highlight={`${event.title}?`} theme={theme}/>
                </View>
                <Text style={style.meta}>
                    {questionCount} {questionCount === 1 ? 'question' : 'questions'} · about {minutes} {minutes === 1 ? 'minute' : 'minutes'} · {formatLongDate(event.startsAt)}
                </Text>
                <View style={style.questions}>
                    {event.survey.questions.map((question, index) => (
                        <QuestionCard key={question.id} question={question} number={index + 1} theme={theme}
                            value={answers[question.id]}
                            onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))} />
                    ))}
                </View>
            </ScrollableSection>
            <View style={style.footer}>
                <ArrowButton label="submit feedback"
                    theme={theme} disabled={!canSubmit}
                    onPress={() => handleSubmitSurvey(event.survey!.id, answers, () => setSubmitted(true))}/>
                {firstMissing !== -1 && (
                    <Text style={style.hint}>Answer question {firstMissing + 1} to submit</Text>
                )}
            </View>
        </PageContainer>
    );
}


const style = StyleSheet.create({
    // back arrow with "SURVEY · FILM SOCIETY" right next to it
    header: {
        justifyContent: 'flex-start',
        gap: 14
    },
    headerLabel: {
        flexShrink: 1,
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted
    },
    // small orange square to the right of the title
    cornerSquare: {
        position: 'absolute',
        top: spacing.gap + 8,
        right: 4,
        width: 22,
        height: 22,
        backgroundColor: theme.s3,
        borderWidth: 2,
        borderColor: theme.ink
    },
    meta: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: theme.muted,
        marginTop: 10
    },
    questions: {
        gap: spacing.gap,
        marginTop: spacing.gap,
        marginBottom: spacing.gap
    },
    // pinned under the scroll area; negative margins let the top line reach the screen edges
    footer: {
        gap: 8,
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 6,
        borderTopWidth: theme.borderWidth,
        borderTopColor: theme.ink,
        backgroundColor: theme.paper
    },
    hint: {
        fontFamily: fonts.body,
        fontSize: 12,
        textAlign: 'center',
        color: theme.muted
    },
    // thank-you screen: everything centered in the space between header and stripes
    thanksContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60 // keeps the group a little above center and clear of the stripes
    },
    thanksTitle: {
        fontFamily: fonts.display,
        fontSize: 52,
        lineHeight: 58,
        textTransform: 'uppercase',
        color: theme.ink,
        marginTop: 24,
        includeFontPadding: false
    },
    thanksText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'center',
        color: theme.muted,
        marginTop: 10,
        paddingHorizontal: 12
    },
    thanksButton: {
        alignSelf: 'stretch', // full width, even inside the centered column
        marginTop: 28
    },
    stripes: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0
    },
    notFoundText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: 10
    }
});
