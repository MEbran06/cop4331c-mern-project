import { fonts, isIOS, spacing, Theme } from "@/constants/theme";
import { ReactNode, useMemo, useState } from "react";
import { Modal, Pressable, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle, TextInputProps } from "react-native";
import { Highlight } from "./decor";
import { Feather } from "@react-native-vector-icons/feather";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";


interface ThemedTextInputProps extends TextInputProps {
    theme: Theme,
    right?: ReactNode,
    wrapperStyle?: StyleProp<ViewStyle>
};

export function ThemedTextInput({theme, right, wrapperStyle, style, ...restProps}: ThemedTextInputProps) {
    const styles = useMemo(() => {
        return stylesGen(theme); 
    }, [theme]);
    return (
        <View style={[styles.wrapper, wrapperStyle]}>
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




interface ThemedDateInputProps {
    theme: Theme,
    value?: Date,                   // undefined shows the placeholder
    onChange: (date: Date) => void,
    placeholder?: string,
    minimumDate?: Date,
    maximumDate?: Date,
    accessibilityLabel?: string
};

// Looks like a text input, but tapping it opens the phone's date picker.
export function ThemedDateInput({theme, value, onChange, placeholder = "mm/dd/yyyy", minimumDate, maximumDate,
    accessibilityLabel = "Choose a date"}: ThemedDateInputProps) {
    const styles = useMemo(() => {
        return stylesGen(theme);
    }, [theme]);
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const pickerValue = value ?? new Date(); // the picker needs a date to start on
    const dateText = value?.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

    function handlePress() {
        // iOS has no popup for this, so the calendar opens under the field
        if (isIOS) {
            setShowIOSPicker((showing) => !showing);
            return;
        }

        DateTimePickerAndroid.open({
            value: pickerValue,
            mode: "date",
            minimumDate,
            maximumDate,
            onValueChange: (_event, date) => onChange(date),
        });
    }

    return (
        <View>
            <Pressable
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityValue={{ text: dateText ?? "No date selected" }}
                style={[styles.wrapper, styles.dateField]}>
                <Text style={[styles.dateText, !dateText && { color: theme.muted }]}>{dateText ?? placeholder}</Text>
                <View style={styles.dateIcon}>
                    <Feather name="calendar" size={20} color={theme.ink}/>
                </View>
            </Pressable>
            {isIOS && showIOSPicker && (
                <View style={styles.iosPicker}>
                    <DateTimePicker
                        value={pickerValue}
                        mode="date"
                        display="inline"
                        themeVariant="light" // every app theme is light, even if the phone is in dark mode
                        accentColor={theme.primary}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                        onValueChange={(_event, date) => {
                            onChange(date);
                            setShowIOSPicker(false);
                        }}/>
                </View>
            )}
        </View>
    );
}

interface ThemedTimeInputProps {
    theme: Theme,
    label: string,                  // the small heading, like "starts"
    value?: Date,                   // undefined shows the placeholder
    onChange: (time: Date) => void,
    placeholder?: string,
    style?: StyleProp<ViewStyle>    // lets a row size the box and join borders
};

// A labelled box showing a time. Tapping it opens the phone's time picker.
export function ThemedTimeInput({theme, label, value, onChange, placeholder = "--:-- --", style}: ThemedTimeInputProps) {
    const styles = useMemo(() => {
        return stylesGen(theme);
    }, [theme]);
    const [iosDraft, setIosDraft] = useState<Date>(); // the time being spun; undefined while the iOS sheet is closed
    const timeText = value?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    function handlePress() {
        const startingTime = value ?? new Date(); // the picker needs a time to start on

        if (isIOS) {
            setIosDraft(startingTime);
            return;
        }

        DateTimePickerAndroid.open({
            value: startingTime,
            mode: "time",
            is24Hour: false,
            onValueChange: (_event, time) => onChange(time),
        });
    }

    function confirmIosTime() {
        if (iosDraft) onChange(iosDraft); // covers pressing done without spinning
        setIosDraft(undefined);
    }

    return (
        <>
            <Pressable
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${label} time`}
                accessibilityValue={{ text: timeText ?? "No time selected" }}
                style={[styles.timeBox, style]}>
                <Text style={styles.timeLabel}>{label}</Text>
                <View style={styles.timeRow}>
                    <Text style={[styles.timeText, !timeText && { color: theme.muted }]}>{timeText ?? placeholder}</Text>
                    <Feather name="clock" size={18} color={theme.ink}/>
                </View>
            </Pressable>

            {isIOS && (
                <Modal
                    visible={!!iosDraft}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setIosDraft(undefined)}>
                    {/* tapping above the sheet cancels */}
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={() => setIosDraft(undefined)}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel"/>
                    <View style={styles.timeSheet}>
                        <Pressable
                            onPress={confirmIosTime}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel="Done"
                            style={{ alignSelf: "flex-end" }}>
                            <Text style={styles.timeDone}>done</Text>
                        </Pressable>
                        <DateTimePicker
                            value={iosDraft ?? new Date()}
                            mode="time"
                            display="spinner"
                            themeVariant="light"
                            textColor={theme.ink}
                            onValueChange={(_event, time) => setIosDraft(time)}/>
                    </View>
                </Modal>
            )}
        </>
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
    inline?: boolean,
    editable?: boolean;               // swaps the title for an input with the same look
    onChangeText?: (text: string) => void;
    placeholder?: string;             // shown (and read by screen readers) while editing

}

export function ThemedDisplayTitle({text, highlight, highlightedFirst=false, theme, fontSize = 60, inline=false,
    editable=false, onChangeText, placeholder}: ThemedDisplayTitleProps) {
    const styles = useMemo(() => {
        return stylesGen(theme, fontSize);
    }, [theme, fontSize]);

    if (editable) {
        // textTransform doesn't apply to TextInput, so this shows what they actually typed
        return (
            <View style={{marginTop: spacing.gap}}>
                <TextInput
                    value={text}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.muted}
                    accessibilityLabel={placeholder}
                    multiline                       // wraps like the Text version
                    submitBehavior="blurAndSubmit"  // Enter closes the keyboard instead of adding a line
                    style={[styles.DisplayText, styles.displayInput]}/>
            </View>
        );
    }

    return (
        <View style={[{marginTop: spacing.gap}, (inline? {flexDirection:"row", alignItems:"center"}: {})]}>
            {highlightedFirst && !!highlight && <Highlight background={theme.hi} textStyle={styles.DisplayText}>{highlight}</Highlight>}
            <Text style={[styles.DisplayText, (inline ? {marginHorizontal: 10}:{})]}>{text}</Text>
            {!highlightedFirst && !!highlight && <Highlight background={theme.hi} textStyle={styles.DisplayText}>{highlight}</Highlight>}
        </View>
    );
}


const stylesGen = (theme: Theme, size: number = 60) => {
    return StyleSheet.create({
        DisplayText: {
            fontFamily: fonts.display, 
            fontSize: size,
            textTransform: 'uppercase',
            color: theme.ink
        },
        displayInput: {
            borderWidth: theme.borderWidth,
            borderColor: theme.ink,
            backgroundColor: theme.paper,
            paddingHorizontal: 10,
            paddingVertical: 4,
            textAlignVertical: 'top' // Android centres multiline text by default
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
        dateField: {
            alignItems: "center"
        },
        dateText: {
            flex: 1,
            fontFamily: fonts.body,
            fontSize: 16,
            paddingHorizontal: 15,
            color: theme.ink
        },
        dateIcon: {
            width: 50,
            alignItems: "center"
        },
        iosPicker: {
            marginTop: 6,
            borderWidth: theme.borderWidth,
            borderColor: theme.ink,
            backgroundColor: theme.card
        },
        timeBox: {
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 4,
            borderWidth: theme.borderWidth,
            borderColor: theme.ink,
            backgroundColor: theme.card
        },
        timeLabel: {
            fontFamily: fonts.label,
            fontSize: 12,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: theme.ink
        },
        timeRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6
        },
        timeText: {
            flexShrink: 1,
            fontFamily: fonts.display,
            fontSize: 22,
            color: theme.ink
        },
        timeSheet: {
            backgroundColor: theme.card,
            borderTopWidth: theme.borderWidth,
            borderTopColor: theme.ink,
            padding: 16,
            paddingBottom: 32
        },
        timeDone: {
            fontFamily: fonts.label,
            fontSize: 16,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: theme.ink
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