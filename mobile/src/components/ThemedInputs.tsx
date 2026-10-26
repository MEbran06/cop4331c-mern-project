import { fonts, Theme } from "@/constants/theme";
import { ReactNode, useMemo } from "react";
import { StyleProp, StyleSheet, Text, TextInput, View, ViewStyle, TextInputProps } from "react-native";


interface ThemedTextInputProps extends TextInputProps {
    theme: Theme,
    right?: ReactNode
};

export function ThemedTextInput({theme, right, style, ...restProps}: ThemedTextInputProps) {
    const styles = useMemo(() => {
        return stylesGen(theme); 
    }, [theme]);
    return (
        <View style={styles.wrapper}>
            <TextInput style={[styles.input, style]} 
                        {...restProps}/>
            {right}
        </View>
    );
}

interface ThemedInputContainerProps {
    children?: ReactNode,
    label?: string,
    labelRight?: ReactNode,
    error?: string,
    style?: StyleProp<ViewStyle>,
    theme: Theme,
    hint ?: string
};

export function ThemedInputContainer({children, label, labelRight, error, style, theme, hint}: ThemedInputContainerProps) {
    const styles = useMemo(() => {
        return stylesGen(theme); 
    }, [theme]);
    return (
        <View style={[styles.container, style]}>

            {(label || labelRight) && (
                <View style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}>
                    {!!label && <Text style={styles.customText}>{label}</Text>}
                    {labelRight}
                </View>
            )}
            {children}
            {!!hint && <Text style={styles.customTextBody}>{hint}</Text>}
            {!!error && <Text style={styles.fieldError}>*{error}</Text>}
        </View>
    );
}


interface ThemedTextProps {

    outerStyle?: StyleProp<ViewStyle>,
    text: string,
    link?: string,
    onLinkPress?: ()=>void,
    theme: Theme
}
export function ThemedText({outerStyle, text, link, onLinkPress, theme}: ThemedTextProps) {
    const styles = useMemo(() => {
        return stylesGen(theme); 
    }, [theme]);
    return (
    <View style={[styles.textRow, outerStyle]}>
        <Text style={styles.customText}>{text}</Text>
        {!!link && <Text style={styles.linkText} onPress={onLinkPress}>
            {link}
        </Text>}
    </View>
    );
}


const stylesGen = (theme: Theme) => {
    return StyleSheet.create({
        input: { 
            flex: 1,  
            fontFamily: fonts.body, 
            fontSize: 16,
            paddingHorizontal: 15
        },
        wrapper: {
            flexDirection: "row", 
            height: 54, 
            borderWidth: theme.borderWidth, 
            backgroundColor: theme.card,
            borderColor: theme.ink
        },
        customText: {
            fontFamily: fonts.label,
            color: theme.ink,
            letterSpacing: 1,
            padding: 5,
            textTransform: 'uppercase'
        },
        fieldError: {
            fontFamily: fonts.label,
            fontSize: 12,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: theme.primaryText,
            marginTop: 6,
        },
        container: {
            gap: 3,
            marginTop: 5
        },
        linkText: {
            fontFamily: fonts.label, 
            color: theme.primaryText, 
            borderBottomWidth: 3,
            letterSpacing: 1,
            paddingTop: 5,
            marginBottom: 5,
            borderBottomColor: theme.primaryText,
            textTransform: "uppercase"
        },
        textRow: {
            flexDirection: "row", 
            justifyContent:"center", 
            marginTop: "auto"
        },
        customTextBody: {
            fontFamily: fonts.body,
            color: theme.muted
        }
    });
};