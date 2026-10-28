import { fonts, spacing, Theme } from "@/constants/theme";
import { ClubEvent, EventStatus, formatDate, formatEnded, formatTimeRange, getEventStatus, isSurveyAvailable } from "@/utils/events";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Lucide } from "@react-native-vector-icons/lucide";
import { HardShadow } from "./decor";
import { ArrowButton } from "./ThemedButton";

interface EventCardProps {
    event: ClubEvent,
    theme: Theme,
    onPress: () => void,
    onTakeSurvey?: (surveyId: string) => void
}

export function EventCard({event, theme, onPress, onTakeSurvey}: EventCardProps) {
    const {month, day, weekday} = formatDate(event.startsAt);
    const status = getEventStatus(event);
    const showSurvey = isSurveyAvailable(event);
    const style = useMemo(() => stylesGen(theme, status), [theme, status]);

    return (
        <HardShadow offset={spacing.shadow} color={theme.ink} style={{marginTop: spacing.gap}}>
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`${event.title}, ${event.club.name}`}
                style={({ pressed }) => [
                    style.eventWrapper,
                    pressed && { transform: [{ translateX: spacing.shadow }, { translateY: spacing.shadow }] }
                ]}>
                <View style={style.dateBlock}>
                    <Text style={style.dateText}>{month}</Text>
                    <Text style={style.dayText}>{day}</Text>
                    <Text style={style.dateText}>{weekday}</Text>
                </View>
                <View style={style.details}>
                    <View style={style.topRow}>
                        <Text style={style.clubName} numberOfLines={1}>{event.club.name}</Text>
                        {status === 'live' && (
                            <View style={style.liveBadge}>
                                <View style={style.liveDot}/>
                                <Text style={style.liveText}>live</Text>
                            </View>
                        )}
                        {status !== 'live' && showSurvey && (
                            <View style={style.surveyBadge}>
                                <Lucide name="clipboard-list" size={12} color={theme.ink}/>
                                <Text style={style.badgeText}>survey open</Text>
                            </View>
                        )}
                    </View>

                    <Text style={style.title}>{event.title}</Text>

                    <View style={style.metaRow}>
                        <Lucide name="clock" size={14} color={theme.ink}/>
                        <Text style={style.metaText}>
                            {status === 'past' ? formatEnded(event.endsAt) : formatTimeRange(event.startsAt, event.endsAt)}
                        </Text>
                    </View>
                    {!!event.location && status !== 'past' && (
                        <View style={style.metaRow}>
                            <Lucide name="map-pin" size={14} color={theme.ink}/>
                            <Text style={style.metaText}>{event.location}</Text>
                        </View>
                    )}

                    {showSurvey && (
                        <View style={style.surveyButton}>
                            <ArrowButton theme={theme} fontsize={16}
                                label={`take survey · ${event.survey!.estimatedMinutes} min`}
                                onPress={() => onTakeSurvey?.(event.survey!.id)}
                                shadowOffset={1}/>
                        </View>
                    )}
                </View>
            </Pressable>
        </HardShadow>
    );
}

// live = black date block, past = yellow, upcoming = white
function dateColors(theme: Theme, status: EventStatus) {
    if (status === 'live') return { background: theme.ink, text: theme.card };
    if (status === 'past') return { background: theme.hi, text: theme.onHi };
    return { background: theme.card, text: theme.ink };
}

const stylesGen = (theme: Theme, status: EventStatus) => {
    const colors = dateColors(theme, status);
    return StyleSheet.create({
        eventWrapper: {
            flexDirection: "row",
            borderWidth: theme.borderWidth,
            borderColor: theme.ink,
            backgroundColor: theme.card
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
        details: {
            flex: 1,
            padding: 12,
            gap: 6
        },
        topRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8
        },
        clubName: {
            flexShrink: 1,
            fontFamily: fonts.label,
            fontSize: 12,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: theme.ink
        },
        liveBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 8,
            paddingVertical: 3,
            backgroundColor: theme.live
        },
        liveDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.onLive
        },
        liveText: {
            fontFamily: fonts.label,
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: theme.onLive
        },
        surveyBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: theme.hi,
            borderWidth: 2,
            borderColor: theme.ink
        },
        badgeText: {
            fontFamily: fonts.label,
            fontSize: 11,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: theme.onHi
        },
        title: {
            fontFamily: fonts.bodyHeavy,
            fontSize: 18,
            lineHeight: 22,
            color: theme.ink
        },
        metaRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6
        },
        metaText: {
            fontFamily: fonts.body,
            fontSize: 13,
            color: theme.ink
        },
        surveyButton: {
            marginTop: 6
        }
    });
};
