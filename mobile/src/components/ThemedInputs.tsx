import { fonts, spacing, Theme } from "@/constants/theme";
import { ReactNode, useMemo } from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle, TextInputProps } from "react-native";
import { Highlight } from "./decor";
import { Feather } from "@react-native-vector-icons/feather";


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

// themed search input for searching clubs
interface ThemedSearchInputProps extends TextInputProps {
    theme: Theme
};

export function ThemedSearchInput({theme, style, value, onChangeText, ...restProps}: ThemedSearchInputProps) {
    const styles = useMemo(() => {
        return stylesGen(theme);
    }, [theme]);
    const hasText = !!value && value.length > 0;
    return (
        <View style={styles.wrapper}>
            <View style={styles.searchIcon}>
                <Feather name="search" size={20} color={theme.ink}/>
            </View>
            <TextInput style={[styles.input, style]}
                        value={value}
                        onChangeText={onChangeText}
                        placeholderTextColor={theme.muted}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                        {...restProps}/>
            {hasText && !!onChangeText && (
                <Pressable style={styles.clearButton}
                    onPress={() => onChangeText('')}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search">
                    <Feather name="x" size={18} color={theme.ink}/>
                </Pressable>
            )}
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

interface ThemedDisplayTitleProps {
    text: string,
    highlight?: string,
    highlightedFirst?: boolean,
    theme: Theme,
    fontSize?: number,
    inline?: boolean
}

export function ThemedDisplayTitle({text, highlight, highlightedFirst=false, theme, fontSize = 60, inline=false}: ThemedDisplayTitleProps) {
    const styles = useMemo(() => {
        return stylesGen(theme, fontSize); 
    }, [theme, fontSize]);
    return (
        <View style={[{marginTop: spacing.gap}, (inline? {flexDirection:"row", alignItems:"center"}: {})]}>
            {highlightedFirst && <Highlight background={theme.hi} textStyle={styles.DisplayText}>{highlight}</Highlight>}
            <Text style={[styles.DisplayText, (inline ? {marginHorizontal: 10}:{})]}>{text}</Text>
            {!highlightedFirst && <Highlight background={theme.hi} textStyle={styles.DisplayText}>{highlight}</Highlight>}
        </View>
    );
}


const stylesGen = (theme: Theme, size: number = 60) => {
    return StyleSheet.create({
        DisplayText: {
            fontFamily: fonts.display, 
            fontSize: size, 
            textTransform: 'uppercase'
        },
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
        // square cell for the magnifying glass, with a divider line on its right
        searchIcon: {
            width: 50,
            justifyContent: "center",
            alignItems: "center",
            borderRightWidth: theme.borderWidth,
            borderRightColor: theme.ink
        },
        clearButton: {
            width: 44,
            justifyContent: "center",
            alignItems: "center"
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