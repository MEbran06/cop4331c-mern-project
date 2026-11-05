import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useMemo } from "react";
import { fonts, Theme } from "@/constants/theme";
import { Follower } from "@/utils/profiles";
import { getInitials } from "./clubRow";

interface Props {
    theme: Theme;
    follower: Follower;
    index: number; // picks the avatar colour, so neighbours differ
    style?: StyleProp<ViewStyle>;
}

function formatFollowedAt(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Oct 21"
}

export function FollowerRow({ theme, follower, index, style: outerStyle }: Props) {
    const style = useMemo(() => styleGen(theme), [theme]);

    // cycle through the theme's accent pairs (background + readable text colour)
    const accents = [
        { bg: theme.s1, fg: theme.s1fg },
        { bg: theme.s3, fg: theme.s3fg },
        { bg: theme.s2, fg: theme.s2fg },
    ];
    const accent = accents[index % accents.length];
    const since = formatFollowedAt(follower.followedAt);

    return (
        <View
            style={[style.row, outerStyle]}
            accessible
            accessibilityLabel={`${follower.name}, following since ${since}`}
        >
            <View style={[style.avatar, { backgroundColor: accent.bg }]}>
                <Text style={[style.initials, { color: accent.fg }]}>{getInitials(follower.name)}</Text>
            </View>
            <View style={style.text}>
                <Text style={style.name} numberOfLines={1}>{follower.name}</Text>
                <Text style={style.since}>Following since {since}</Text>
            </View>
        </View>
    );
}

const AVATAR = 44;

const styleGen = (theme: Theme) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        backgroundColor: theme.card,
    },
    avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        fontFamily: fonts.label,
        fontSize: 15,
        letterSpacing: 0.5,
    },
    text: {
        flex: 1,
        gap: 2,
    },
    name: {
        fontFamily: fonts.bodyHeavy,
        fontSize: 16,
        color: theme.ink,
    },
    since: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: theme.muted,
    },
});
