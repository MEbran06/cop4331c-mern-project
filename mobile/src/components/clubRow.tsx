import { View, Text, StyleSheet, StyleProp, ViewStyle, Pressable } from "react-native"
import { ThemedBox } from "./ThemedBox"
import { fonts, Theme } from "@/constants/theme";
import { useMemo } from "react";
import { ThemedButton } from "./ThemedButton";
import {Feather} from "@react-native-vector-icons/feather";
import { Club } from "@/utils/events";


function getInitials(name: string) {
    const words = name.trim().split(/\s+/);
    const initials = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
    return initials.toUpperCase();
}

interface Props {
    theme: Theme,
    clubInfo: Club,
    onFollowButtonPress: ()=>void,
    isFollowing: boolean,
    onBoxPress?: ()=>void,
    style?: StyleProp<ViewStyle> 
}

export function ClubRow({theme, clubInfo, onFollowButtonPress, isFollowing, onBoxPress,style: outerStyle} : Props) {
    const style = useMemo(()=>styleGen(theme), [theme])
    return (
        <Pressable
         onPress={onBoxPress} 
         style={[style.clubInfoContainer, outerStyle]}
         accessibilityRole="button"
         accessibilityLabel={`${clubInfo.name}`}
         accessibilityHint="Opens the club's profile">
            <ThemedBox text={getInitials(clubInfo.name)} size={48} theme={theme} fontColor={theme.ink} hasShadow={false}/>
        
            <View style={style.clubText}>
                <Text style={style.clubName} numberOfLines={1}>{clubInfo.name}</Text>
                <Text style={style.clubFollowers}>
                    {clubInfo.followers} {clubInfo.followers === 1 ? 'follower' : 'followers'}
                </Text>
            </View>
            <ThemedButton
                onPress={onFollowButtonPress} theme={theme}
                variant="plain"
                shadowOffset={3}
                shawdowOn={!isFollowing}
                accessibilityLabel={isFollowing ? `Unfollow ${clubInfo.name}` : `Follow ${clubInfo.name}`}
                style={[style.followButton, isFollowing && style.followButtonActive]}>
                <Feather name={isFollowing ? 'check' : 'plus'} size={16}
                    color={isFollowing ? theme.card : theme.ink}/>
                <Text style={[style.followText, isFollowing && style.followTextActive]}>
                    {isFollowing ? 'following' : 'follow'}
                </Text>
            </ThemedButton>
        </Pressable>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
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
});