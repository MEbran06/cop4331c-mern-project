import { PageContainer } from "@/components/PageContainer";
import { StyleSheet, Text, View, Share, Button, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClubEvent, formatLongDate, formatTimeRange, getEventFromId } from "@/utils/events";
import { DotGrid, HardShadow } from "@/components/decor";
import { ButtonHeader } from "@/components/ButtonHeader";
import { theme } from "@/app/preferences";
import { fonts, spacing } from "@/constants/theme";
import * as Linking from 'expo-linking';
import { ScrollableSection } from "@/components/ScrollableSection";

async function handlePressed(event: ClubEvent | undefined) {

    if (!event)
        return;

    const link = Linking.createURL(`/event/${event.id}`);
    await Share.share({ message: `${event.title} by ${event.club.name}\n${link}` });
 
}

export default function EventDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string; }>();
    const event = getEventFromId(id) as ClubEvent;
    const router = useRouter();
    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} theme={theme} buttonType="arrow-left">
                <Pressable onPress={async () => await handlePressed(event)}
                    style={({ pressed }) => [
                                style.linkWrapper,
                                {
                                backgroundColor: pressed ? '#e1e1e1' : undefined, // Darker blue when pressed
                                },
                            ]}>
                        <Text style={style.shareLink}>SHARE</Text>
                </Pressable>
            </ButtonHeader>
                <ScrollableSection>
                    <EventSummary
                        title={event?.title}
                        clubName={event.club.name}
                        date={formatLongDate(event.startsAt)}
                        time={formatTimeRange(event.startsAt, event.endsAt)}
                        location={event.location ?? 'To be announced'}
                        subtitle={event.subtitle}
                    />
                
            </ScrollableSection>
        </PageContainer>
    );
}

interface EventSummaryProps {
    title: string,
    clubName: string,
    date: string,
    time: string,
    location: string,
    subtitle?: string
}

function EventSummary({
    title,
    clubName,
    date,
    time,
    location,
    subtitle
}: EventSummaryProps) {
    return (
        <HardShadow color={theme.ink} style={{ marginTop: spacing.gap }}>
            <View style={style.summaryContainer}>
                <View style={style.summaryTitle}>
                    <View style={style.dotGrid}>
                        <DotGrid color={theme.ink} width={40} height={32} />
                    </View>
                    <Text style={style.presents}>{clubName} presents</Text>
                    <Text style={style.title}>{title}</Text>
                    {!!subtitle && <Text style={style.subtitle}>{subtitle}</Text>}
                </View>
                <View style={style.summaryDateTimeWrapper}>
                    <View style={[style.infoCell, style.infoCellHalf, style.infoCellDivider]}>
                        <Text style={style.infoLabel}>date</Text>
                        <Text style={style.infoValue}>{date}</Text>
                    </View>
                    <View style={[style.infoCell, style.infoCellHalf]}>
                        <Text style={style.infoLabel}>time</Text>
                        <Text style={style.infoValue}>{time}</Text>
                    </View>
                </View>
                <View style={style.infoCell}>
                    <Text style={style.infoLabel}>where</Text>
                    <Text style={style.infoValue}>{location}</Text>
                </View>
            </View>
        </HardShadow>
    );
}

const style = StyleSheet.create({
    summaryContainer: {
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    // yellow block
    summaryTitle: {
        backgroundColor: theme.hi,
        padding: 16,
        gap: 4,
        borderBottomWidth: theme.borderWidth,
        borderBottomColor: theme.ink
    },
    dotGrid: {
        position: 'absolute',
        top: 14,
        right: 14
    },
    presents: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.onHi,
        paddingRight: 48 // keeps long club names clear of the dot grid
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 44,
        lineHeight: 52,
        textTransform: 'uppercase',
        color: theme.onHi,
        includeFontPadding: false
    },
    subtitle: {
        fontFamily: fonts.bodySemi,
        fontSize: 15,
        color: theme.onHi
    },
    // DATE | TIME row
    summaryDateTimeWrapper: {
        flexDirection: 'row',
        borderBottomWidth: theme.borderWidth,
        borderBottomColor: theme.ink
    },
    infoCell: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 4
    },
    infoCellHalf: {
        flex: 1
    },
    infoCellDivider: {
        borderRightWidth: theme.borderWidth,
        borderRightColor: theme.ink
    },
    infoLabel: {
        fontFamily: fonts.label,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted
    },
    infoValue: {
        fontFamily: fonts.bodyBold,
        fontSize: 16,
        color: theme.ink
    },
    shareLink:{
        fontFamily: fonts.label,  
        borderBottomWidth: 3,
        letterSpacing: 1,
        color: theme.ink, 
        borderBottomColor: theme.ink, 
        fontSize: 18
    },
    linkWrapper: {
        paddingTop: 5,
        marginRight: 15,
        marginBottom: 5,
    }


});