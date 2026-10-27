import { StyleSheet, View, Text, TextInput } from "react-native";
import { HardShadow } from "./decor";
import { useMemo, useRef, useState } from "react";
import {Feather} from "@react-native-vector-icons/feather"
import { ComponentProps } from "react";
import { fonts, spacing, Theme } from "@/constants/theme";

type FeatherProps = ComponentProps<typeof Feather>;

interface CodeBoxProps {
    size: number,
    theme: Theme,
    selected?: boolean,
    digit?: string,
}

export function CodeBox({size, theme, selected=false, digit}: CodeBoxProps) {
    const color = selected ? theme.hi : theme.card;
    const style = useMemo(() => styleGen(size, color, theme), [size, color, theme]);
    return (
        <HardShadow color={(!!digit || selected) ? theme.ink : "transparent"}>
            <View style={style.box}>
                {!!digit && <Text style={style.boxedText}>{digit}</Text>}
            </View>
        </HardShadow>
    );

}

interface VerificationBoxProps {
    theme: Theme,
    value: string,
    onChangeText: (t:string)=>unknown
}

export function VerificationBox({theme, value, onChangeText}: VerificationBoxProps) {
    return (
        <View> 
            <View style={{flexDirection:"row", gap: 5, marginTop:spacing.gap}}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <CodeBox theme={theme} size={50} selected={i===value.length} digit={value[i]} key={i}/>
                ))}
            </View>
            <TextInput
                value={value}
                onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                style={{
                    position: "absolute",
                    top:0,
                    left:0,
                    right:0,
                    bottom:0,
                    opacity:0.1,
                    color: "transparent",
                }}
                caretHidden={true}
                
                /* keyboardType, maxLength, textContentType, autoComplete */
            />
            <Text style={{
                fontFamily: fonts.body,
                color: theme.muted,
                marginTop: 5
            }}>{6 - value.length} digits to go</Text>
        </View>

    );
}

const styleGen = (size: number, color: string|undefined, theme: Theme) => StyleSheet.create({
    box: {
        backgroundColor: color,
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
        color: theme.ink,
        fontSize: size/2
    }
});