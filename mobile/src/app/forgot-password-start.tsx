import { ButtonHeader } from "@/components/ButtonHeader";
import { DotGrid, StripeBand } from "@/components/decor";
import { PageContainer } from "@/components/PageContainer";
import { ScrollableSection } from "@/components/ScrollableSection";
import { ThemedBox } from "@/components/ThemedBox";
import { ImperativeRouter, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/theme";
import { fonts, spacing } from "@/constants/theme";
import { ThemedDisplayTitle, ThemedInputContainer, ThemedText, ThemedTextInput } from "@/components/ThemedInputs";
import { useState } from "react";
import * as z from 'zod';
import { ArrowButton } from "@/components/ThemedButton";
import { useSession } from "@/contexts/ctx";
import { ApiRequest } from "@events/api";
import { requestPasswordReset } from "@/utils/api";
import { useApi } from "@/hooks/useApi";

const emailFormSchema = z.object({
    email: z.string().min(1, {message: 'Email is required'}).email({message: "Invalid email address"})
});

async function handleSubmit(data: {email: string}, setErrors: CallableFunction, router: ImperativeRouter, api: ApiRequest): Promise<void>{
    const result = emailFormSchema.safeParse(data);
    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return;
    }
    setErrors(undefined); // the email is valid now, so clear the old message

    const {devResetToken} = await requestPasswordReset(data.email, api);
    router.push({ 
        pathname: '/password-reset-code', 
        params: { 
            email: data.email,
            // TEMP: until the backend emails a code, pass its dev token straight through
            resetToken: devResetToken
        }
    });
}

export default function ForgotPassword() {
    const { theme } = useTheme();
    const router = useRouter();
    const {session} = useSession();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{email?: string[]}>();
    const [submitting, setSubmitting] = useState(false);
    const api = useApi();

    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}>
                <Text>step 1 of 3</Text>
            </ButtonHeader>
            <ScrollableSection>
            <View style={styles.headerWrapper}>
                <ThemedBox theme={theme} size={120} icon='key'/>
                <DotGrid color={theme.ink} />
            </View>
            <ThemedDisplayTitle fontSize={54} text='forgot your' highlight="password?" theme={theme}/>
            <Text style={{color: theme.ink, fontFamily: fonts.body, marginTop: 10}}>
                No problem. Enter the email you signed up with and we'll send you a 6-digit code
            </Text>
            <ThemedInputContainer theme={theme} label='email' 
                error={errors?.email?.at(0)} hint="Club accounts: use the club's email.">
                <ThemedTextInput autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder='you@university.edu' value={email} onChangeText={setEmail} theme={theme}/>
            </ThemedInputContainer>
            <View style={{marginTop: 20,}}>
            <ArrowButton label='Send Code' theme={theme} loading={submitting}
                onPress={async () => {
                    setSubmitting(true);
                    try {
                        await handleSubmit({email}, setErrors, router, api);
                    } catch (err) {
                        // the request failed: show why under the email field
                        setErrors({ email: [err instanceof Error ? err.message : 'Could not send the code. Try again.'] });
                    } finally {
                        setSubmitting(false);
                    }
                }}>
            </ArrowButton>
            </View>
            </ScrollableSection>
            <ThemedText text='remembered it?' 
                theme={theme} link={!!session ? 'go back' :'log in'}
                onLinkPress={()=>!!session ? router.back() : router.navigate('/sign-in')}/>
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
    }
});