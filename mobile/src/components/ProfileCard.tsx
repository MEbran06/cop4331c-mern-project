import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native"
import { useMemo } from "react";
import { fonts, Theme } from "@/constants/theme";
import { ThemedBox } from "./ThemedBox";
import { HardShadow } from "./decor";
import { getInitials } from "./clubRow";

interface Props {
    theme: Theme,
    name: string,
    email: string,
    style?: StyleProp<ViewStyle>
}

// The summary card at the top of the profile tab: initials tile, name, email, badge
export function ProfileCard({theme, name, email, style: outerStyle}: Props) {
    const style = useMemo(()=>styleGen(theme), [theme]);
    return (
        <HardShadow color={theme.ink} style={outerStyle}>
            {/* read as one item by screen readers instead of three separate texts */}
            <View style={style.card}
                accessible
                accessibilityLabel={`${name}, ${email}`}>
                <ThemedBox text={getInitials(name)} size={64} theme={theme}
                    color={theme.hi} fontColor={theme.onHi} hasShadow={false}/>

                {/* flex: 1 so long names and emails wrap instead of running off the card */}
                <View style={style.text}>
                    <Text style={style.name}>{name}</Text>
                    <Text style={style.email}>{email}</Text>
                </View>
            </View>
        </HardShadow>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 16,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    text: {
        flex: 1,
        gap: 2
    },
    name: {
        fontFamily: fonts.display,
        fontSize: 28,
        lineHeight: 40,
        textTransform: "uppercase",
        color: theme.ink,
        includeFontPadding: false
    },
    email: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: theme.muted
    }
});
