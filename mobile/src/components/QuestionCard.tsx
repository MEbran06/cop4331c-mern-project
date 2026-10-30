import { fonts, Theme } from "@/constants/theme";
import { SurveyQuestion } from "@/utils/events";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { HardShadow } from "./decor";

// single_choice and text -> a string, multiple_choice -> an array of the chosen options
export type SurveyAnswer = string | string[];

export function isQuestionAnswered(answer: SurveyAnswer | undefined): boolean {
    if (Array.isArray(answer)) return answer.length > 0;
    return !!answer && answer.trim().length > 0;
}

const TYPE_LABELS: Record<SurveyQuestion['type'], string> = {
    single_choice: 'choose one',
    multiple_choice: 'choose any',
    text: 'your answer',
};

interface QuestionCardProps {
    question: SurveyQuestion,
    number: number,                 // shown as "01", "02", ...
    value: SurveyAnswer | undefined,
    onChange: (value: SurveyAnswer) => void,
    theme: Theme
}

// The frame every question shares. Picks the right input for the question's type.
export function QuestionCard({question, number, value, onChange, theme}: QuestionCardProps) {
    const style = useMemo(() => stylesGen(theme), [theme]);
    const header = [String(number).padStart(2, '0'), TYPE_LABELS[question.type], question.required && 'required']
        .filter(Boolean)
        .join(' · ');

    return (
        <HardShadow color={theme.ink}>
            <View style={style.card}>
                <Text style={style.header}>{header}</Text>
                <Text style={style.questionText}>{question.text}</Text>
                {renderInput(question, value, onChange, theme, style)}
            </View>
        </HardShadow>
    );
}

function renderInput(question: SurveyQuestion, value: SurveyAnswer | undefined, onChange: (value: SurveyAnswer) => void,
    theme: Theme, style: ReturnType<typeof stylesGen>) {
    switch (question.type) {
        case 'single_choice':
            return <ChoiceInput options={question.options} multiple={false} value={value} onChange={onChange} theme={theme} style={style}/>;
        case 'multiple_choice':
            return <ChoiceInput options={question.options} multiple={true} value={value} onChange={onChange} theme={theme} style={style}/>;
        case 'text':
            return <TextAnswer value={typeof value === 'string' ? value : ''} onChange={onChange} theme={theme} style={style}/>;
    }
}

interface ChoiceInputProps {
    options: string[],
    multiple: boolean,              // true = pick any (checkboxes), false = pick one (radio buttons)
    value: SurveyAnswer | undefined,
    onChange: (value: SurveyAnswer) => void,
    theme: Theme,
    style: ReturnType<typeof stylesGen>
}

function ChoiceInput({options, multiple, value, onChange, theme, style}: ChoiceInputProps) {
    const selected = Array.isArray(value) ? value : value ? [value] : [];

    const onPress = (option: string) => {
        if (!multiple) {
            onChange(option);
        } else if (selected.includes(option)) {
            onChange(selected.filter((o) => o !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <View style={style.options}>
            {options.map((option) => {
                const isSelected = selected.includes(option);
                return (
                    <Pressable key={option}
                        onPress={() => onPress(option)}
                        accessibilityRole={multiple ? 'checkbox' : 'radio'}
                        accessibilityState={{ checked: isSelected }}
                        accessibilityLabel={option}
                        style={[style.option, isSelected && style.optionSelected]}>
                        {/* circle = pick one, square = pick any */}
                        <View style={[multiple ? style.checkbox : style.radio, multiple && isSelected && style.checkboxSelected]}>
                            {isSelected && (multiple
                                ? <Feather name="check" size={14} color={theme.card}/>
                                : <View style={style.radioDot}/>)}
                        </View>
                        <Text style={style.optionText}>{option}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

interface TextAnswerProps {
    value: string,
    onChange: (value: SurveyAnswer) => void,
    theme: Theme,
    style: ReturnType<typeof stylesGen>
}

function TextAnswer({value, onChange, theme, style}: TextAnswerProps) {
    return (
        <TextInput
            style={style.textAnswer}
            value={value}
            onChangeText={onChange}
            placeholder="Type your answer"
            placeholderTextColor={theme.muted}
            multiline
            textAlignVertical="top" // Android starts multiline text in the middle otherwise
        />
    );
}

const stylesGen = (theme: Theme) => StyleSheet.create({
    card: {
        gap: 10,
        padding: 16,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    header: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted
    },
    questionText: {
        fontFamily: fonts.bodyHeavy,
        fontSize: 17,
        lineHeight: 22,
        color: theme.ink
    },
    options: {
        gap: 8,
        marginTop: 4
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    optionSelected: {
        backgroundColor: theme.hi
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2.5,
        borderColor: theme.ink,
        backgroundColor: theme.card,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.ink
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2.5,
        borderColor: theme.ink,
        backgroundColor: theme.card,
        alignItems: 'center',
        justifyContent: 'center'
    },
    // ticked checkbox turns black so the white check shows; radios keep a white circle with a dot
    checkboxSelected: {
        backgroundColor: theme.ink
    },
    optionText: {
        flex: 1,
        fontFamily: fonts.bodySemi,
        fontSize: 15,
        color: theme.ink
    },
    textAnswer: {
        minHeight: 96,
        padding: 12,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card,
        fontFamily: fonts.body,
        fontSize: 15,
        color: theme.ink
    }
});
