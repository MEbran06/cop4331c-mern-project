import { ThemedBox } from '@/components/ThemedBox';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from './preferences';
import { DotGrid, StripeBand } from '@/components/decor';
import { ButtonHeader } from '@/components/ButtonHeader';
import { ImperativeRouter, useLocalSearchParams, useRouter } from 'expo-router';
import { fonts, spacing } from '@/constants/theme';
import { PageContainer } from '@/components/PageContainer';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { VerificationBox } from '@/components/CodeBox';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ArrowButton } from '@/components/ThemedButton';
import { useState } from 'react';

function handleResetCode(code: string, router: ImperativeRouter) {
    // todo: handle the submitted verification
    router.navigate("/new-password");
}

function handleResendCode() {
    // todo: ask the backend to send a new code
    return;
}

export default function PasswordReset() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const [code, setCode] = useState('');
    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}>
                <Text>step 2 of 3</Text>
            </ButtonHeader>
            <ScrollableSection>
            <View style={styles.headerWrapper}>
                <ThemedBox theme={theme} size={120} icon='mail'/>
                <DotGrid color={theme.ink} />
            </View>
            <ThemedDisplayTitle fontSize={54} theme={theme} text="enter the" highlight='reset code'/>
            <Text style={{color: theme.muted, fontFamily: fonts.body, marginTop: 10}}>
                If an account exists for <Text style={{fontFamily: fonts.bodyBold}}>{email}</Text>, a 6-digit code is on its way.
            </Text>
            <VerificationBox theme={theme} value={code} onChangeText={setCode} />
            <View style={{marginTop: spacing.gap}}>
                <ArrowButton disabled={code.length < 6} theme={theme} label='continue' onPress={() => handleResetCode(code, router)}/>
            </View>
            <View style={styles.helpBox}>
                <Text style={styles.helpText}>
                    Didn't get it? Check your spam folder. The code expires in 10 minutes.
                </Text>
                <View style={styles.helpLinks}>
                    <Text style={styles.helpLink} onPress={handleResendCode}>resend code</Text>
                </View>
            </View>
            </ScrollableSection>
            <StripeBand ink={theme.ink} background={theme.card} style={{ position: 'absolute', left: 0, right: 0, bottom: 0}} />
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    headerWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: spacing.gap
    },
    helpBox: {
        marginTop: spacing.gap,
        marginBottom: 48, // keeps the box clear of the stripe band at the bottom
        padding: 14,
        gap: 12,
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    helpText: {
        fontFamily: fonts.body,
        fontSize: 13,
        lineHeight: 18,
        color: theme.ink
    },
    helpLinks: {
        flexDirection: "row",
        gap: 16
    },
    helpLink: {
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: theme.ink,
        borderBottomWidth: 2,
        borderBottomColor: theme.ink
    }
});