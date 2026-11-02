import { View, Text, StyleSheet, StyleProp, ViewStyle, Pressable } from "react-native"
import { ComponentProps, ReactNode, useMemo } from "react";
import { Feather } from "@react-native-vector-icons/feather";
import { fonts, Theme } from "@/constants/theme";

type FeatherProps = ComponentProps<typeof Feather>;

interface Props {
    theme: Theme,
    icon: FeatherProps['name'],
    title: string,
    subtitle?: string,
    onPress?: ()=>void,
    right?: ReactNode,   // replaces the chevron, e.g. a toggle switch
    style?: StyleProp<ViewStyle>
}

// One row of the settings list: icon, title + subtitle, chevron on the right
export function SettingsRow({theme, icon, title, subtitle, onPress, right, style: outerStyle}: Props) {
    const style = useMemo(()=>styleGen(theme), [theme]);
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [style.row, pressed && style.rowPressed, outerStyle]}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint={subtitle}>
            <Feather name={icon} size={20} color={theme.ink}/>

            {/* flex: 1 pushes the chevron to the right edge and lets the subtitle wrap */}
            <View style={style.text}>
                <Text style={style.title}>{title}</Text>
                {!!subtitle && <Text style={style.subtitle}>{subtitle}</Text>}
            </View>

            {right ?? <Feather name="chevron-right" size={20} color={theme.ink}/>}
        </Pressable>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        minHeight: 68, // the height of a row with a subtitle, so rows without one match
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: theme.card
    },
    rowPressed: {
        backgroundColor: theme.paper
    },
    text: {
        flex: 1,
        gap: 2
    },
    title: {
        fontFamily: fonts.bodyHeavy,
        fontSize: 15,
        color: theme.ink
    },
    subtitle: {
        fontFamily: fonts.body,
        fontSize: 13,
        color: theme.muted
    }
});
