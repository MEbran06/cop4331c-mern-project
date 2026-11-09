import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Lucide from "@react-native-vector-icons/lucide";
import { fonts, Theme } from "@/constants/theme";
import { SurveyQuestion, SurveyQuestionType } from "@/utils/events";
import { HardShadow } from "./decor";
import { ThemedInputContainer, ThemedTextInput } from "./ThemedInputs";

const MIN_OPTIONS = 2;

const TYPE_INFO = {
    text: { label: "written answer", icon: "align-left" },
    single_choice: { label: "single choice", icon: "circle-dot" },
    multiple_choice: { label: "multiple choice", icon: "list-checks" },
} as const;

let nextNewId = 0;

// A blank question of the given type, id is temp.
export function newSurveyQuestion(type: SurveyQuestionType): SurveyQuestion {
    nextNewId += 1;
    return {
        id: `new-${nextNewId}`,
        text: "",
        type,
        options: type === "text" ? [] : Array<string>(MIN_OPTIONS).fill(""),
        required: true,
    };
}

interface SurveyQuestionEditorProps {
    theme: Theme;
    index: number;  
    question: SurveyQuestion;
    onChange: (question: SurveyQuestion) => void; 
    onRemove: () => void;
    textError?: string;
    optionsError?: string;
}

// One question card. The survey screen owns the question
export function SurveyQuestionEditor({theme, index, question, onChange, onRemove, textError, optionsError}: SurveyQuestionEditorProps) {
    const style = useMemo(()=>styleGen(theme), [theme]);
    const number = String(index + 1).padStart(2, "0");
    const typeInfo = TYPE_INFO[question.type];

    return (
        <HardShadow>
            <View style={style.card}>
                <View style={style.header}>
                    <Text style={style.number}>{number}</Text>
                    <View style={style.badge}>
                        <Lucide name={typeInfo.icon} size={13} color={theme.card}/>
                        <Text style={style.badgeText}>{typeInfo.label}</Text>
                    </View>
                    <Pressable
                        onPress={onRemove}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove question ${index + 1}`}
                        style={({ pressed }) => [style.remove, pressed && { opacity: 0.6 }]}>
                        <Lucide name="trash-2" size={22} color={theme.ink}/>
                    </Pressable>
                </View>

                <View style={style.body}>
                    <ThemedInputContainer theme={theme} label="question" error={textError}>
                        <ThemedTextInput
                            theme={theme}
                            value={question.text}
                            onChangeText={(text) => onChange({ ...question, text })}
                            placeholder="What do you want to ask?"
                            placeholderTextColor={theme.muted}
                            style={{ color: theme.ink }}/>
                    </ThemedInputContainer>

                    {question.type === "text" ? (
                        <Text style={style.note}>Students type their own answer.</Text>
                    ) : (
                        <ChoiceOptions theme={theme} question={question} onChange={onChange} error={optionsError}/>
                    )}

                    <Pressable
                        onPress={() => onChange({ ...question, required: !question.required })}
                        hitSlop={6}
                        accessibilityRole="checkbox"
                        accessibilityLabel="Required question"
                        accessibilityState={{ checked: question.required }}
                        style={style.requiredRow}>
                        <View style={[style.checkbox, question.required && { backgroundColor: theme.ink }]}>
                            {question.required && <Lucide name="check" size={14} color={theme.card}/>}
                        </View>
                        <Text style={style.requiredText}>required</Text>
                    </Pressable>
                </View>
            </View>
        </HardShadow>
    );
}

interface ChoiceOptionsProps {
    theme: Theme;
    question: SurveyQuestion;
    onChange: (question: SurveyQuestion) => void;
    error?: string;
}

// The option list. Single choice shows circles and multiple choice shows squares.
function ChoiceOptions({theme, question, onChange, error}: ChoiceOptionsProps) {
    const style = useMemo(()=>styleGen(theme), [theme]);
    const isSingle = question.type === "single_choice";
    const canRemove = question.options.length > MIN_OPTIONS;

    function updateOption(index: number, text: string) {
        const options = question.options.map((option, i) => i === index ? text : option);
        onChange({ ...question, options });
    }

    function removeOption(index: number) {
        onChange({ ...question, options: question.options.filter((_, i) => i !== index) });
    }

    return (
        <ThemedInputContainer theme={theme} label="options" error={error}>
            <View style={style.options}>
                {question.options.map((option, index) => (
                    <View key={index} style={style.optionRow}>
                        <View style={[style.marker, isSingle && { borderRadius: 11 }]}/>
                        <ThemedTextInput
                            theme={theme}
                            value={option}
                            onChangeText={(text) => updateOption(index, text)}
                            placeholder={`Option ${index + 1}`}
                            placeholderTextColor={theme.muted}
                            accessibilityLabel={`Option ${index + 1}`}
                            wrapperStyle={style.optionInput}
                            style={{ color: theme.ink }}/>
                        {canRemove && (
                            <Pressable
                                onPress={() => removeOption(index)}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove option ${index + 1}`}>
                                <Lucide name="x" size={20} color={theme.ink}/>
                            </Pressable>
                        )}
                    </View>
                ))}
            </View>

            <Pressable
                onPress={() => onChange({ ...question, options: [...question.options, ""] })}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Add option"
                style={({ pressed }) => [style.addOption, pressed && { opacity: 0.6 }]}>
                <Lucide name="plus" size={18} color={theme.ink}/>
                <Text style={style.addOptionText}>add option</Text>
            </Pressable>
        </ThemedInputContainer>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.card,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: theme.borderWidth,
        borderBottomColor: theme.ink
    },
    number: {
        fontFamily: fonts.display,
        fontSize: 24,
        color: theme.ink
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: theme.ink,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    badgeText: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.card
    },
    remove: {
        marginLeft: "auto"
    },
    body: {
        padding: 12,
        gap: 10
    },
    note: {
        fontFamily: fonts.body,
        fontSize: 14,
        color: theme.muted
    },
    options: {
        gap: 8
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    marker: {
        width: 22,
        height: 22,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink
    },
    optionInput: {
        flex: 1,
        height: 46
    },
    addOption: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        marginTop: 10
    },
    addOptionText: {
        fontFamily: fonts.label,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink,
        borderBottomWidth: 2,
        borderBottomColor: theme.ink
    },
    requiredRow: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 8
    },
    checkbox: {
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: theme.borderWidth,
        borderColor: theme.ink
    },
    requiredText: {
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink
    }
});
