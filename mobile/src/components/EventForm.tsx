import { ReactNode, useState } from "react";
import { View } from "react-native";
import * as z from "zod";
import { spacing, Theme } from "@/constants/theme";
import { ScrollableSection } from "./ScrollableSection";
import { ArrowButton } from "./ThemedButton";
import { ThemedDateInput, ThemedDisplayTitle, ThemedInputContainer, ThemedTextInput, ThemedTimeInput } from "./ThemedInputs";

const minutesOfDay = (time: Date) => time.getHours() * 60 + time.getMinutes();

function combine(date: Date, time: Date): string {
    const result = new Date(date);
    result.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return result.toISOString();
}

const eventFormSchema = z.object({
    title: z.string().trim().min(1, "Enter a title"),
    date: z.date({ required_error: "Pick a date" }),
    startTime: z.date({ required_error: "Pick a start time" }),
    endTime: z.date({ required_error: "Pick an end time" }),
    location: z.string(),
    description: z.string(),
}).refine((data) => minutesOfDay(data.endTime) > minutesOfDay(data.startTime), {
    message: "Must end after it starts",
    path: ["endTime"], // shows the error under the end field
});

interface FormErrors {
    title?: string[],
    date?: string[],
    startTime?: string[],
    endTime?: string[],
    location?: string[],
    description?: string[]
}

// What the form starts with. Create leaves it empty, edit fills it from the event.
export interface EventFormValues {
    title?: string,
    date?: Date,
    startTime?: Date,
    endTime?: Date,
    location?: string,
    description?: string
}

// What the screen gets once the form is valid, shaped for the API.
export interface EventFormResult {
    title: string,
    startsAt: string,
    endsAt: string,
    location: string,
    description: string
}

interface EventFormProps {
    theme: Theme,
    heading: string,                // first word of the title
    highlight: string,              // yellow word of the title
    submitLabel: string,
    initialValues?: EventFormValues,
    onSubmit: (event: EventFormResult) => Promise<void>,
    footer?: ReactNode              // extra content at the end of the scrolling form
}

// The fields only read initialValues on the first render, so render this after the data has loaded.
export function EventForm({theme, heading, highlight, submitLabel, initialValues, onSubmit, footer}: EventFormProps) {
    const [title, setTitle] = useState(initialValues?.title ?? '');
    const [date, setDate] = useState(initialValues?.date);
    const [startTime, setStartTime] = useState(initialValues?.startTime);
    const [endTime, setEndTime] = useState(initialValues?.endTime);
    const [location, setLocation] = useState(initialValues?.location ?? '');
    const [description, setDescription] = useState(initialValues?.description ?? '');
    const [errors, setErrors] = useState<FormErrors>();
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit() {
        setErrors(undefined);
        setSubmitError('');

        const result = eventFormSchema.safeParse({title, date, startTime, endTime, location, description});
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                title: result.data.title,
                startsAt: combine(result.data.date, result.data.startTime),
                endsAt: combine(result.data.date, result.data.endTime),
                location: result.data.location,
                description: result.data.description,
            });
        } catch {
            setSubmitError("Could not save the event. Try again.");
        } finally {
            setSubmitting(false); // always runs, even if the request throws
        }
    }

    return (
        <>
            <ScrollableSection>
                <ThemedDisplayTitle theme={theme} fontSize={46} text={heading} highlight={highlight} inline/>
                <ThemedInputContainer theme={theme} label="event name" error={errors?.title?.[0]}>
                    <ThemedTextInput
                        value={title} onChangeText={setTitle}
                        theme={theme} placeholder="e.g Movie Night"/>
                </ThemedInputContainer>

                <ThemedInputContainer theme={theme} label="date" error={errors?.date?.[0]}>
                    <ThemedDateInput theme={theme} value={date} onChange={setDate} minimumDate={new Date()} />
                </ThemedInputContainer>
                <View style={{ flexDirection: "row", marginTop: spacing.gap }}>
                    <ThemedInputContainer theme={theme} style={{ flex: 1 }} error={errors?.startTime?.[0]}>
                        <ThemedTimeInput theme={theme} label="starts" value={startTime} onChange={setStartTime} />
                    </ThemedInputContainer>
                    <ThemedInputContainer theme={theme} style={{ flex: 1 }} error={errors?.endTime?.[0]}>
                        <ThemedTimeInput theme={theme} label="ends" value={endTime} onChange={setEndTime}
                            style={{ borderLeftWidth: 0 }} />
                    </ThemedInputContainer>
                </View>
                <ThemedInputContainer theme={theme} label="location" error={errors?.location?.[0]}>
                    <ThemedTextInput
                        value={location} onChangeText={setLocation}
                        theme={theme} placeholder="Building and room"/>
                </ThemedInputContainer>
                <ThemedInputContainer theme={theme} label="description" error={errors?.description?.[0]}>
                    <ThemedTextInput
                        theme={theme}
                        value={description} onChangeText={setDescription}
                        placeholder="What should people know? Bring anything? Free food?"
                        multiline
                        wrapperStyle={{ height: 140 }}
                        style={{ paddingVertical: 12, textAlignVertical: "top" }}
                        />
                </ThemedInputContainer>
                {!!submitError && <ThemedInputContainer theme={theme} error={submitError}/>}
                {footer}
            </ScrollableSection>
            <View>
                <ArrowButton label={submitLabel} theme={theme} loading={submitting} onPress={handleSubmit}/>
            </View>
        </>
    );
}
