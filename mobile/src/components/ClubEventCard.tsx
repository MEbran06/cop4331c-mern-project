import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { HardShadow } from "./decor";
import { fonts, Theme } from "@/constants/theme";
import { useMemo } from "react";
import { ClubManagedEvent, ClubSurvey, EventStatus, formatDate, getEventStatus } from "@/utils/events";
import Lucide from "@react-native-vector-icons/lucide";
import { Href, useRouter } from "expo-router";


function formatTimeRangeRN(start: Date, end: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    let startStr = start.toLocaleTimeString('en-US', options);
    const endStr = end.toLocaleTimeString('en-US', options);

    const startPeriod = startStr.slice(-2); // "AM" or "PM"
    const endPeriod = endStr.slice(-2);

    if (startPeriod === endPeriod) {
        // remove any AM or PM
        startStr = startStr.replace(/\s*[AP]M$/i, '');
    }
    return `${startStr} - ${endStr}`;
}

function surveyStatus(survey: ClubSurvey | undefined) {

    if (!survey) {
        return "none yet";
    }

    if (survey.status === "draft")
        return "draft ready";
    
    return survey.status;
}

function resolveSurveyLinkInfo(survey: ClubSurvey | undefined, eventId: string): {
    label: string,
    href: Href
} {
    if (!survey) {
        return { label: "add survey", href: "/(user_club)/event/[eventId]/survey/create" };
    }

    if (survey.status === "closed") {
        return {
            label: "survey results",
            href: {
                pathname: "/(user_club)/event/[eventId]/survey/results",
                params: { eventId: eventId},
            },
        };
    }

    return {
        label: "edit survey",
        href: {
            pathname: "/(user_club)/event/[eventId]/survey/edit",
            params: { eventId: eventId },
        },
    };
}


interface Props {
    theme: Theme;
    event: ClubManagedEvent;
    onEditClick: ()=>void;

}

export function ClubUpcomingEventCard({theme, event, onEditClick}: Props) {
    const status = getEventStatus(event);
    const {month, day, weekday} = formatDate(event.startsAt)
    const style = useMemo(()=>styleGen(theme, status), [theme, status]);
    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    const router = useRouter();
    const {label, href} = resolveSurveyLinkInfo(event.survey, event.id);
    return (
        <HardShadow>
            <View style={style.CardContainer}>
                <View style={style.infoContainer}>
                    <View style={style.dateBlock}>
                        <Text style={style.dateText}>{month}</Text>
                        <Text style={style.dayText}>{day}</Text>
                        <Text style={style.dateText}>{weekday}</Text>
                    </View>
                    <View style={style.eventInfoBlock}>
                        <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                            <Text style={style.infoDisplayText}>{event.title}</Text>
                            <Pressable
                                accessibilityLabel="edit event"
                                accessibilityRole="button"
                                onPress={onEditClick}
                                >
                                <Lucide name='pen' size={22} color={theme.ink}/>
                            </Pressable>
                        </View>
                        <View style={{marginTop: 5, flexDirection:"row", alignItems:"center"}}>
                            <Lucide name="clock" size={10} color={theme.muted}/>
                            <Text style={style.infoText}> {formatTimeRangeRN(start, end)}</Text>
                        </View>
                        <View style={{flexDirection:"row", alignItems:"center"}}>
                            <Lucide name="map-pin" size={11} color={theme.muted}/>
                            <Text style={style.infoText}> {event.location}</Text>
                        </View>
                    </View>
                </View>
                <View style={style.surveyContainer}>
                    <View style={style.surveyStatus}>
                        {event.survey && event.survey.status === "draft" &&
                         <Lucide name='pen' size={15} color={theme.ink}/>}
                        <Text style={style.surveyStatusText}>survey: {surveyStatus(event.survey)}</Text>
                    </View>
                    <Pressable
                        accessibilityLabel={label}
                        accessibilityRole="button"
                        hitSlop={10} // the link is small, so give it a bigger tap area
                        onPress={()=>router.push(href)}
                        style={({ pressed }) => [style.surveyLink, pressed && { opacity: 0.6 }]}
                        >
                        <Text style={style.surveyLinkText}>{label}</Text>
                    </Pressable>
                </View>
            </View>
        </HardShadow>
    );
}

// Only surveys that were published can have results, so anything else has no href.
function resolvePastSurveyInfo(survey: ClubSurvey | undefined, eventId: string): {
    summary: string,
    isDraft: boolean,
    href?: Href
} {
    if (!survey) {
        return { summary: "no survey", isDraft: false };
    }

    if (survey.status === "draft") {
        return { summary: "survey not published", isDraft: true };
    }

    const responses = `${survey.responseCount} ${survey.responseCount === 1 ? "response" : "responses"}`;
    return {
        summary: `survey ${survey.status} · ${responses}`,
        isDraft: false,
        href: {
            pathname: "/(user_club)/event/[eventId]/survey/results",
            params: { eventId: eventId },
        },
    };
}

interface PastRowProps {
    theme: Theme;
    event: ClubManagedEvent;
    style?: StyleProp<ViewStyle>; // lets the list add a divider between rows
}

// One row of the past events list. The list provides the border and shadow.
export function ClubPastEventRow({theme, event, style: outerStyle}: PastRowProps) {
    const style = useMemo(()=>pastStyleGen(theme), [theme]);
    const router = useRouter();
    const {month, day} = formatDate(event.startsAt);
    const {summary, isDraft, href} = resolvePastSurveyInfo(event.survey, event.id);

    return (
        <Pressable
            disabled={!href}
            onPress={()=>{ if (href) router.push(href); }}
            accessibilityRole="button"
            accessibilityState={{ disabled: !href }}
            accessibilityLabel={`${event.title}, ${month} ${day}. ${summary}`}
            accessibilityHint={href ? "Opens the survey results" : undefined}
            style={({ pressed }) => [style.row, pressed && { backgroundColor: theme.paper }, outerStyle]}
            >
            <View style={style.date}>
                <Text style={style.month}>{month}</Text>
                <Text style={style.day}>{day}</Text>
            </View>
            <View style={style.info}>
                <Text style={style.title}>{event.title}</Text>
                {isDraft ? (
                    <View style={style.badge}>
                        <Text style={style.badgeText}>{summary}</Text>
                    </View>
                ) : (
                    <Text style={style.summary}>{summary}</Text>
                )}
            </View>
            {!!href && <Lucide name="chevron-right" size={24} color={theme.ink}/>}
        </Pressable>
    );
}

interface SeeAllRowProps {
    theme: Theme;
    label: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>; // lets the list add a divider above it
}

// The last row of a list, for when there are more items than the list shows.
export function SeeAllRow({theme, label, onPress, style: outerStyle}: SeeAllRowProps) {
    const style = useMemo(()=>pastStyleGen(theme), [theme]);

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [style.seeAllRow, pressed && { backgroundColor: theme.paper }, outerStyle]}
            >
            <Text style={style.seeAllText}>{label}</Text>
            <Lucide name="chevron-right" size={24} color={theme.ink}/>
        </Pressable>
    );
}

const pastStyleGen = (theme: Theme) => StyleSheet.create({
    seeAllRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 52,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: theme.card
    },
    seeAllText: {
        fontFamily: fonts.label,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 72,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: theme.card
    },
    date: {
        width: 40,
        alignItems: "center"
    },
    month: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink
    },
    day: {
        fontFamily: fonts.display,
        fontSize: 26,
        color: theme.ink
    },
    info: {
        flex: 1, // takes the free space, so long titles wrap before the chevron
        alignItems: "flex-start",
        gap: 4
    },
    title: {
        fontFamily: fonts.bodyHeavy,
        fontSize: 17,
        color: theme.ink
    },
    summary: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.muted
    },
    badge: {
        backgroundColor: theme.hi,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    badgeText: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.onHi
    }
});

function dateColors(theme: Theme, status: EventStatus) {
    if (status === 'live') return { background: theme.primary, text: theme.ink };
    if (status === 'upcoming') return { background: theme.ink, text: theme.card };
    return { background: theme.card, text: theme.ink };
}

const styleGen = (theme: Theme, status: EventStatus) => {
    const colors = dateColors(theme, status);
    return StyleSheet.create({
    CardContainer: {
        backgroundColor: theme.card,
        minHeight: 100,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink
    },
    infoContainer: {
        flexDirection: "row",
        borderBottomColor: theme.ink,
        borderBottomWidth: theme.borderWidth,
        minHeight: 55
    },
    dateBlock: {
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: colors.background,
        borderRightWidth: theme.borderWidth,
        borderRightColor: theme.ink
    },
    dateText: {
        fontFamily: fonts.label,
        fontSize: 12,
        lineHeight: 14,
        textTransform: "uppercase",
        letterSpacing: 1,
        color: colors.text,
        includeFontPadding: false,
        marginVertical: -8
    },
    dayText: {
        fontFamily: fonts.display,
        fontSize: 34,
        lineHeight: 50,
        color: colors.text,
        includeFontPadding: false
    },
    eventInfoBlock: {
        flex: 1,
        padding: 10
    },
    infoText: {
        color: theme.muted,
        fontFamily: fonts.body
    },
    infoDisplayText: {
        fontFamily: fonts.label,
        fontSize: 22
    },
    surveyContainer: {
        minHeight: 40,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    surveyStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flexShrink: 1 // a long status wraps instead of pushing the link off the card
    },
    surveyStatusText: {
        flexShrink: 1,
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink
    },
    surveyLink: {
        borderBottomWidth: 2,
        borderBottomColor: theme.ink,
        paddingBottom: 2
    },
    surveyLinkText: {
        fontFamily: fonts.label,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink
    }

});}