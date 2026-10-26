import { Pressable, StyleSheet, Text, View } from 'react-native';
import { themes, fonts, Theme, spacing } from '@/constants/theme';
import { theme, isIOS } from './preferences';
import { ArrowButton, IconButton } from '@/components/ThemedButton';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonHeader } from '@/components/ButtonHeader';
import { Highlight } from '@/components/decor';

export default function SignUp() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.container, {paddingTop:insets.top, paddingBottom:insets.bottom}]}>
        <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}>
            <Text>step 1 of 2</Text>
        </ButtonHeader>
            
        <View style={{marginTop: spacing.gap}}>
            <Text style={styles.DisplayText}>create your</Text>
            <Highlight background={theme.hi} textStyle={styles.DisplayText}>account</Highlight>
        </View>

        <View>
            <Text style={styles.customText}>I'm signing up as</Text>
            
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    DisplayText: {
        fontFamily: fonts.display, 
        fontSize: 48, 
        textTransform: 'uppercase'
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    customText: {
        fontFamily: fonts.label,
        color: theme.ink,
        letterSpacing: 1,
        padding: 5,
        textTransform: "uppercase"
    }
});

