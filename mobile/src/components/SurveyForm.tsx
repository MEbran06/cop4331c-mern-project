import { useState } from "react";
import { Text, View } from "react-native";
import Lucide from "@react-native-vector-icons/lucide";
import * as z from "zod";
import { fonts, spacing, Theme } from "@/constants/theme";
import { SurveyQuestion } from "@/utils/events";
import { ScrollableSection } from "./ScrollableSection";
import { newSurveyQuestion, SurveyQuestionEditor } from "./SurveyQuestionEditor";
import { ArrowButton, ThemedButton } from "./ThemedButton";
import { ThemedDisplayTitle, ThemedInputContainer, ThemedTextInput } from "./ThemedInputs";

const questionText = z.string().trim().min(1, "Enter a question");

const surveySchema = z.object({
    title: z.string().trim().min(1, "Enter a title"),
    questions: z.array(z.discriminatedUnion("type", [
        z.object({
            id: z.string(),
            type: z.literal("text"),
            text: questionText,
            options: z.array(z.string()),
            required: z.boolean(),
        }),
        z.object({
            id: z.string(),
            type: z.enum(["single_choice", "multiple_choice"]),
            text: questionText,
            options: z.array(z.string().trim().min(1, "Fill in every option"))
                .min(2, "Add at least 2 options"),
            required: z.boolean(),
        }),
    ])).min(1, "Add at least one question"),
});

type QuestionErrors = Record<string, { text?: string; options?: string }>;
type FieldErrors = { title?: string };

// Questions the user just added have no id, so the server can create one.
export type SurveyFormQuestion = Omit<SurveyQuestion, "id"> & { id?: string };

// What the screen gets when a button is pressed. Only publish has been validated.
export interface SurveyFormResult {
    title: string;
    questions: SurveyFormQuestion[];
}

// Removes the temporary ids from newSurveyQuestion, and keeps the real ones from the server.
function withoutTempIds(questions: SurveyQuestion[]): SurveyFormQuestion[] {
    return questions.map(({ id, ...question }) => id.startsWith("new-") ? question : { id, ...question });
}

interface SurveyFormProps {
    theme: Theme;
    heading: string;                // first word of the title
    initialValues?: { title: string; questions: SurveyQuestion[] };
    onSaveDraft: (survey: SurveyFormResult) => Promise<void>;
    onPublish: (survey: SurveyFormResult) => Promise<void>;
}

// The fields only read initialValues on the first render, so render this after the data has loaded.
export function SurveyForm({theme, heading, initialValues, onSaveDraft, onPublish}: SurveyFormProps) {
    const [title, setTitle] = useState(initialValues?.title ?? '');
    const [questions, setQuestions] = useState<SurveyQuestion[]>(initialValues?.questions ?? []);
    const [questionErrors, setQuestionErrors] = useState<QuestionErrors>({});
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function clearErrors() {
        setQuestionErrors({});
        setFieldErrors({});
        setFormError('');
    }

    async function save(request: () => Promise<void>) {
        setSubmitting(true);
        try {
            await request();
        } catch {
            setFormError("Could not save the survey. Try again.");
        } finally {
            setSubmitting(false); // always runs, even if the request throws
        }
    }

    async function handleSaveDraft() {
        clearErrors();
        await save(() => onSaveDraft({ title, questions: withoutTempIds(questions) }));
    }

    async function handlePublish() {
        clearErrors();
        const result = surveySchema.safeParse({ title, questions });

        if (!result.success) {
            const byQuestion: QuestionErrors = {};
            const fields: FieldErrors = {};
            let message = "";

            for (const issue of result.error.issues) {
                const [first, index, field] = issue.path;
                if (first !== "questions") {
                    fields[first as keyof FieldErrors] ??= issue.message;
                } else if (typeof index !== "number") {
                    message = issue.message; // at least 1 question
                } else {
                    const id = questions[index].id;
                    const key = field === "text" ? "text" : "options";
                    byQuestion[id] ??= {};
                    byQuestion[id][key] ??= issue.message; // keeps the first error per field
                }
            }
            setQuestionErrors(byQuestion);
            setFieldErrors(fields);
            setFormError(message);
            return;
        }

        await save(() => onPublish({ title: result.data.title, questions: withoutTempIds(result.data.questions) }));
    }

    return (
        <>
            <View style={{marginBottom: spacing.gap}}>
                <ThemedDisplayTitle fontSize={50} theme={theme} text={heading} highlight="survey" inline/>
            </View>
            <ScrollableSection>
                <View style={{ marginTop: spacing.gap, gap: 8 }}>
                    <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: theme.muted }}>
                        Add a question
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <AddQuestionButton theme={theme} icon="text-align-start" label="short text"
                            onPress={() => setQuestions([...questions, newSurveyQuestion("text")])}/>
                        <AddQuestionButton theme={theme} icon="circle-dot" label="single choice"
                            onPress={() => setQuestions([...questions, newSurveyQuestion("single_choice")])}/>
                        <AddQuestionButton theme={theme} icon="list-checks" label="multiple choice"
                            onPress={() => setQuestions([...questions, newSurveyQuestion("multiple_choice")])}/>
                    </View>
                </View>
                <ThemedInputContainer style={{marginBottom: spacing.gap}} theme={theme} label="title" error={fieldErrors.title}>
                    <ThemedTextInput theme={theme} value={title} onChangeText={setTitle}/>
                </ThemedInputContainer>

                {!!formError && <ThemedInputContainer theme={theme} error={formError}/>}
                {questions.map((question, index) => (
                    <View style={{marginVertical:4}} key={question.id}>
                        <SurveyQuestionEditor
                            theme={theme}
                            index={index}
                            textError={questionErrors[question.id]?.text}
                            optionsError={questionErrors[question.id]?.options}
                            question={question}
                            onChange={(updated) => setQuestions(questions.map((q) => q.id === updated.id ? updated : q))}
                            onRemove={() => setQuestions(questions.filter((q) => q.id !== question.id))}
                        />
                    </View>
                ))}
            </ScrollableSection>
            <View style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <View style={{
                    flex: 1,
                    marginRight: 3
                }}>
                    <ArrowButton
                        variant="plain"
                        label='Save Draft' theme={theme} loading={submitting}
                        shadowOffset={1}
                        fontsize={15}
                        onPress={handleSaveDraft}/>
                </View>
                <View style={{
                    flex: 1
                }}>
                    <ArrowButton label='Publish' theme={theme} loading={submitting}
                        shadowOffset={1}
                        fontsize={18}
                        onPress={handlePublish}/>
                </View>
            </View>
        </>
    );
}

function AddQuestionButton({theme, icon, label, onPress}: {
    theme: Theme,
    icon: "text-align-start" | "circle-dot" | "list-checks",
    label: string,
    onPress: () => void,
}) {
    return (
        <View style={{ flex: 1 }}>
            <ThemedButton theme={theme} variant="plain" shadowOffset={3} onPress={onPress} accessibilityLabel={`Add ${label} question`}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 6, minHeight: 76, padding: 8 }}>
                    <Lucide name={icon} size={22} color={theme.ink}/>
                    <Text style={{ fontFamily: fonts.label, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textAlign: "center", color: theme.ink }}>
                        {label}
                    </Text>
                </View>
            </ThemedButton>
        </View>
    );
}
