import { fonts, spacing, Theme } from "@/constants/theme";
import { ClubEvent } from "@/utils/events";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EventCard } from "./EventCard";

interface EventSectionProps {
    title: string,
    events: ClubEvent[],
    theme: Theme,
    onEventPress: (event: ClubEvent) => void
}

// A heading ("HAPPENING NOW") with its event cards. Renders nothing when there are no events.
export function EventSection({title, events, theme, onEventPress}: EventSectionProps) {
    const style = useMemo(() => stylesGen(theme), [theme]);
    if (events.length === 0) return null;

    return (
        <View style={style.section}>
            <Text style={style.heading}>{title}</Text>
            {events.map((event) => (
                <EventCard key={event.id} event={event} theme={theme} onPress={() => onEventPress(event)}/>
            ))}
        </View>
    );
}

const stylesGen = (theme: Theme) => StyleSheet.create({
    section: {
        marginTop: spacing.gap
    },
    heading: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted
    }
});
