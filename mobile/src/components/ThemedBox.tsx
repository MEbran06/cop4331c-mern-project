import { StyleSheet, View, Text } from "react-native";
import { HardShadow } from "./decor";
import { useMemo } from "react";
import {Feather} from "@react-native-vector-icons/feather"
import { ComponentProps } from "react";
import { fonts, spacing, Theme } from "@/constants/theme";

type FeatherProps = ComponentProps<typeof Feather>;

interface ThemedBoxProps {
    icon?: FeatherProps['name'],
    text?: string,
    size: number,
    color?: string,
    fontColor?: string,
    hasShadow?: boolean,
    theme: Theme
}

export function ThemedBox({icon, text, size, color, hasShadow=true, fontColor, theme}: ThemedBoxProps) {

    const style = useMemo(() => styleGen(size, color, fontColor, theme), [size, color, fontColor, theme]);
    return (
        <HardShadow color={hasShadow?theme.ink:"transparent"}>
            <View style={style.box}>
                {!!icon && <Feather name={icon} size={size/2} color={theme.ink}/>}
                {!!text && <Text style={style.boxedText}>{text}</Text>}
            </View>
        </HardShadow>
    );

}

const styleGen = (size: number, color: string|undefined, fontColor: string|undefined, theme: Theme) => StyleSheet.create({
    box: {
        backgroundColor: color ? color : theme.hi,
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: size * 0.03,
        borderColor: theme.ink
    },
    boxedText: {
        fontFamily: fonts.display,
        textTransform: "uppercase",
        color: fontColor ? fontColor : theme.card,
        fontSize: size/2
    }
});