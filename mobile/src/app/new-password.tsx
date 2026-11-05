import { ButtonHeader } from "@/components/ButtonHeader";
import { PageContainer } from "@/components/PageContainer";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";
import { useTheme } from "@/contexts/theme";
import { ScrollableSection } from "@/components/ScrollableSection";
import { ThemedDisplayTitle, ThemedInputContainer, ThemedTextInput } from "@/components/ThemedInputs";
import { fonts, spacing } from "@/constants/theme";
import { useState } from "react";
import { ArrowButton, EyeButton } from "@/components/ThemedButton";
import * as z from 'zod';
import { StripeBand } from "@/components/decor";
import { AuthUser, useSession } from "@/contexts/ctx";

const newPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'] // show the error under the confirm field
});

async function handleSubmit(
    data: {password: string, passwordConfirm: string}, 
    resetToken: string, 
    setErrors: CallableFunction,
    user: AuthUser | null): Promise<boolean> {
    const result = newPasswordSchema.safeParse(data);
    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return false;
    }
    setErrors(undefined);
    
    // Todo: replace with backend call
    return true;
}

export default function NewPassword() {
    const { theme } = useTheme();
    const {user} = useSession();
    const router = useRouter();
    const { resetToken } = useLocalSearchParams<{ resetToken: string }>();
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<{password?: string[], passwordConfirm?: string[]}>();

    if (!resetToken) {
        return (
            <PageContainer>
                <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}/>
                <ThemedDisplayTitle fontSize={48} theme={theme} text="reset link" highlight='expired'/>
                <Text style={{color: theme.muted, fontFamily: fonts.body, marginTop: 10}}>
                    This password reset is missing or no longer valid. Start again to get a new code.
                </Text>
                <View style={{marginTop: spacing.gap}}>
                    <ArrowButton theme={theme} label='start again' onPress={() => router.replace('/forgot-password-start')}/>
                </View>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}>
                <Text>step 3 of 3</Text>
            </ButtonHeader>
            <ScrollableSection>
                <ThemedDisplayTitle fontSize={54} theme={theme} text="set a new" highlight='password'/>
                <Text style={{color: theme.muted, fontFamily: fonts.body, marginTop: 10}}>
                    Pick something you haven't used here before
                </Text>
                <ThemedInputContainer style={{marginTop:spacing.gap}} theme={theme} label="new password" error={errors?.password?.at(0)}>
                    <ThemedTextInput theme={theme}
                        secureTextEntry={isPasswordHidden}
                        placeholder='Password' value={password}
                        onChangeText={setPassword}
                        right={<EyeButton theme={theme} toggle={isPasswordHidden} onPress={() => setPasswordHidden(!isPasswordHidden)}/>}/>
                </ThemedInputContainer>
                <ThemedInputContainer style={{marginTop:spacing.gap}} theme={theme} label="confirm password" error={errors?.passwordConfirm?.at(0)}>
                    <ThemedTextInput theme={theme}
                        secureTextEntry={isPasswordHidden}
                        placeholder='Password' value={passwordConfirm}
                        onChangeText={setPasswordConfirm}/>
                </ThemedInputContainer>
                <View style={{marginTop: spacing.gap}}>
                    <ArrowButton label='save password' theme={theme}
                        loading={submitting}
                        disabled={!password || !passwordConfirm}
                        onPress={async () => {
                            setSubmitting(true)
                            try {
                                const success = await handleSubmit({password, passwordConfirm}, resetToken, setErrors, user);
                                if (success) {
                                    Alert.alert('Password updated', user ? 'Your new password is saved.' : 'Log in with your new password.');
                                    router.dismissAll();
                                }
                            } finally {
                                setSubmitting(false);
                            }
                        }}/>
                </View>
            </ScrollableSection>
            <StripeBand ink={theme.ink} background={theme.card} style={{ position: 'absolute', left: 0, right: 0, bottom: 0}} />
        </PageContainer>
    );
}
