import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { fonts, Theme } from "@/constants/theme";
import { SurveyQuestionResult } from "@/utils/events";
import { HardShadow } from "./decor";

type ChoiceQuestionResult = Extract<SurveyQuestionResult, { type: "single_choice" | "multiple_choice" }>;

const TYPE_LABELS = {
    single_choice: "single choice",
    multiple_choice: "multiple choice",
} as const;

interface ChoiceResultCardProps {
    theme: Theme;
    index: number;
    question: ChoiceQuestionResult;
}

export function ChoiceResultCard({theme, index, question}: ChoiceResultCardProps) {
    const style = useMemo(()=>styleGen(theme), [theme]);

    return (
        <HardShadow>
            <View style={style.card}>
                <Text style={style.eyebrow}>Q{index + 1} · {TYPE_LABELS[question.type]}</Text>
                <Text style={style.question}>{question.text}</Text>

                {question.options.map((option) => {
                    // answeredCount leaves out students who skipped an optional question
                    const percent = question.answeredCount > 0
                        ? Math.round((option.count / question.answeredCount) * 100)
                        : 0;

                    return (
                        <View
                            key={option.label}
                            style={style.option}
                            accessible
                            accessibilityLabel={`${option.label}, ${percent} percent, ${option.count} ${option.count === 1 ? "response" : "responses"}`}>
                            <View style={style.optionHeader}>
                                <Text style={style.optionLabel}>{option.label}</Text>
                                <Text style={style.optionCount}>{percent}% · {option.count}</Text>
                            </View>
                            <View style={style.barTrack}>
                                {percent > 0 && <View style={[style.barFill, { width: `${percent}%` }]}/>}
                            </View>
                        </View>
                    );
                })}
            </View>
        </HardShadow>
    );
}

type TextQuestionResult = Extract<SurveyQuestionResult, { type: "text" }>;

interface TextResultCardProps {
    theme: Theme;
    index: number;
    question: TextQuestionResult;
}

export function TextResultCard({theme, index, question}: TextResultCardProps) {
    const style = useMemo(()=>styleGen(theme), [theme]);

    return (
        <HardShadow>
            <View style={style.card}>
                <Text style={style.eyebrow}>
                    Q{index + 1} · short text · {question.answeredCount} {question.answeredCount === 1 ? "answer" : "answers"}
                </Text>
                <Text style={style.question}>{question.text}</Text>

                {question.answers.length === 0 ? (
                    <Text style={style.noAnswers}>No answers yet</Text>
                ) : (
                    question.answers.map((answer, answerIndex) => (
                        <View key={answerIndex} style={style.answer}>
                            <Text style={style.answerText}>{answer}</Text>
                        </View>
                    ))
                )}
            </View>
        </HardShadow>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    noAnswers: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: theme.muted,
        marginTop: 8
    },
    answer: {
        backgroundColor: theme.paper,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 10
    },
    answerText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.ink
    },
    card: {
        backgroundColor: theme.card,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        padding: 16
    },
    eyebrow: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: theme.muted
    },
    question: {
        fontFamily: fonts.bodyHeavy,
        fontSize: 18,
        color: theme.ink,
        marginTop: 4,
        marginBottom: 4
    },
    option: {
        marginTop: 10
    },
    optionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
        marginBottom: 6
    },
    optionLabel: {
        flex: 1, // long options wrap before they reach the count
        fontFamily: fonts.body,
        fontSize: 15,
        color: theme.ink
    },
    optionCount: {
        fontFamily: fonts.label,
        fontSize: 14,
        color: theme.ink
    },
    barTrack: {
        height: 18,
        backgroundColor: theme.paper,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink
    },
    barFill: {
        height: "100%",
        backgroundColor: theme.primary,
        borderRightWidth: theme.borderWidth,
        borderRightColor: theme.ink
    }
});
