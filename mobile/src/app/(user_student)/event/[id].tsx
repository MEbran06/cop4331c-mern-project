import { PageContainer } from "@/components/PageContainer";
import { StyleSheet, Text, View, Share, Button, Pressable } from "react-native";
import { ImperativeRouter, useLocalSearchParams, useRouter } from 'expo-router';
import { ClubEvent, estimateSurveyMinutes, formatLongDate, formatTimeRange, getEventFromId, isSurveyAvailable } from "@/utils/events";
import { DotGrid, HardShadow } from "@/components/decor";
import { ButtonHeader } from "@/components/ButtonHeader";
import { theme } from "@/app/preferences";
import { fonts, spacing } from "@/constants/theme";
import * as Linking from 'expo-linking';
import { ScrollableSection } from "@/components/ScrollableSection";
import { ThemedDisplayTitle } from "@/components/ThemedInputs";
import { ArrowButton, ThemedButton } from "@/components/ThemedButton";
import { ThemedBox } from "@/components/ThemedBox";
import { Feather } from "@react-native-vector-icons/feather";
import { useState } from "react";

async function handleShared(event: ClubEvent | undefined) {

    if (!event)
        return;

    const link = Linking.createURL(`/event/${event.id}`);
    await Share.share({ message: `${event.title} by ${event.club.name}\n${link}` });
 
}

function handleGoToSurvey(event: ClubEvent, router: ImperativeRouter) {

    router.push({ 
        pathname: "/(user_student)/survey/[eventId]", 
        params: {eventId: event.id}})
}

function handleToggleFollow(setter: (val: boolean)=>void, isFollowing: boolean) {
    setter(!isFollowing);
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/);
    const initials = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
    return initials.toUpperCase();
}

export default function EventDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string; }>();
    const event = getEventFromId(id);
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(event?.club.isFollowing ?? false);

    // Opened from a shared link there's no screen to go back to, so go to the feed instead
    const goBack = () => router.canGoBack() ? router.back() : router.replace('/');

    if (!event) {
        return (
            <PageContainer>
                <ButtonHeader onAction={goBack} theme={theme} buttonType="arrow-left"/>
                <ThemedDisplayTitle fontSize={48} theme={theme} text="event not" highlight="found"/>
                <Text style={style.notFoundText}>
                    This event may have been removed, or the link you followed is out of date.
                </Text>
                <View style={{ marginTop: spacing.gap }}>
                    <ArrowButton theme={theme} label="back to feed" onPress={() => router.replace('/')}/>
                </View>
            </PageContainer>
        );
    }
    return (
        <PageContainer>
            <ButtonHeader onAction={goBack} theme={theme} buttonType="arrow-left">
                <Pressable onPress={async () => await handleShared(event)}
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
                        title={event.title}
                        clubName={event.club.name}
                        date={formatLongDate(event.startsAt)}
                        time={formatTimeRange(event.startsAt, event.endsAt)}
                        location={event.location ?? 'To be announced'}
                        subtitle={event.subtitle}
                    />  
                    {isSurveyAvailable(event) &&
                    <View style={style.surveyContainer}>
                        <View style={style.surveyRow}>
                            <ThemedBox size={50} theme={theme} hasShadow={false} icon="clipboard"/>
                            {/* flex: 1 makes the text take the space left by the icon, so it wraps instead of overflowing */}
                            <View style={style.surveyTextColumn}>
                                <Text style={style.surveyText}>share your feedback</Text>
                                <Text style={style.surveyTextInfo}>
                                    {event.club.name} wants to hear how it went. {event.survey!.questions.length} questions, about {estimateSurveyMinutes(event.survey!)} {estimateSurveyMinutes(event.survey!) === 1 ? 'minute' : 'minutes'}.
                                </Text>
                            </View>
                        </View>
                        <ArrowButton theme={theme} fontsize={16}
                                label="take survey"
                                onPress={() => handleGoToSurvey(event,router)}/>
                    </View>}
                    {
                        !!event.description &&
                        <View style={{marginTop: spacing.gap}}>
                            <Text style={[style.infoLabel, {
                                fontSize: 14,
                                marginVertical: 5
                            }]}>about</Text>
                            <Text style={{
                                fontFamily: fonts.body,
                                lineHeight: 20
                            }}>
                                {event.description}
                            </Text>
                        </View>
                    }
                    <View style={{marginTop: spacing.gap}}>
                        <Text style={style.sectionLabel}>hosted by</Text>
                        <View style={style.clubInfoContainer}>
                            <ThemedBox text={getInitials(event.club.name)} size={48} theme={theme} fontColor={theme.ink} hasShadow={false}/>
                        
                            <View style={style.clubText}>
                                <Text style={style.clubName} numberOfLines={1}>{event.club.name}</Text>
                                <Text style={style.clubFollowers}>
                                    {event.club.followers} {event.club.followers === 1 ? 'follower' : 'followers'}
                                </Text>
                            </View>
                            <ThemedButton
                                onPress={()=>handleToggleFollow(setIsFollowing, isFollowing)} theme={theme}
                                variant="plain"
                                shadowOffset={3}
                                shawdowOn={!isFollowing}
                                accessibilityLabel={isFollowing ? `Unfollow ${event.club.name}` : `Follow ${event.club.name}`}
                                style={[style.followButton, isFollowing && style.followButtonActive]}>
                                <Feather name={isFollowing ? 'check' : 'plus'} size={16}
                                    color={isFollowing ? theme.card : theme.ink}/>
                                <Text style={[style.followText, isFollowing && style.followTextActive]}>
                                    {isFollowing ? 'following' : 'follow'}
                                </Text>
                            </ThemedButton>
                        </View>
                    </View>
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
    sectionLabel: {
        fontFamily: fonts.label,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted,
        marginVertical: 5
    },
    // HOSTED BY box: initials tile | name + followers | follow button
    clubInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    clubText: {
        flex: 1,
        gap: 2
    },
    clubName: {
        fontFamily: fonts.bodyHeavy,
        fontSize: 17,
        color: theme.ink
    },
    clubFollowers: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: theme.muted
    },
    followButton: {
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10
    },
    followButtonActive: {
        backgroundColor: theme.ink
    },
    followText: {
        fontFamily: fonts.label,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.ink
    },
    followTextActive: {
        color: theme.card
    },
    surveyText: {
        fontFamily: fonts.label,
        fontSize: 18,
        textTransform: 'uppercase',
        color: theme.ink,
        includeFontPadding: false
    },
    surveyTextInfo: {
        fontFamily: fonts.body,
        fontSize: 14,
        lineHeight: 20,
        color: theme.muted
    },
    surveyContainer: {
        padding: 16,
        gap: 16,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card,
        marginTop: spacing.gap
    },
    // icon box on the left, heading + text on the right
    surveyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12
    },
    surveyTextColumn: {
        flex: 1,
        gap: 4
    },
    notFoundText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: 10
    },
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