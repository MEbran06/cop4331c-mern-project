import { ButtonHeader } from "@/components/ButtonHeader";
import { PageContainer } from "@/components/PageContainer";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { theme } from "./preferences";
import { ScrollableSection } from "@/components/ScrollableSection";
import { ThemedDisplayTitle, ThemedInputContainer, ThemedTextInput } from "@/components/ThemedInputs";
import { fonts, spacing } from "@/constants/theme";
import { useState } from "react";
import { ArrowButton, EyeButton } from "@/components/ThemedButton";
import { useSession } from "@/contexts/ctx";
import * as z from 'zod';
// simulate for now since backend hasn't implemented it
import { simulateGenerateToken, UserPayload } from '@/utils/mockJwt'
import { StripeBand } from "@/components/decor";

// replace with the short-lived reset token from the backend once it exists
const MOCK_RESET_TOKEN = 'mock-reset-token';

const newPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'] // show the error under the confirm field
});

async function handleSubmit(data: {password: string, passwordConfirm: string}, resetToken: string, setErrors: CallableFunction): Promise<string> {
    const result = newPasswordSchema.safeParse(data);
    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return '';
    }
    setErrors(undefined);
    const user: UserPayload = {
        id: '1',
        email: 'user@university.edu',
        role: "club"
    };
    // replace with call to backend, sending resetToken and data.password
    const token = await simulateGenerateToken(user);
    return token;
}

export default function NewPassword() {
    const router = useRouter();
    const { signIn } = useSession();
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errors, setErrors] = useState<{password?: string[], passwordConfirm?: string[]}>();

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
                        right={<EyeButton toggle={isPasswordHidden} onPress={() => setPasswordHidden(!isPasswordHidden)}/>}/>
                </ThemedInputContainer>
                <ThemedInputContainer style={{marginTop:spacing.gap}} theme={theme} label="confirm password" error={errors?.passwordConfirm?.at(0)}>
                    <ThemedTextInput theme={theme}
                        secureTextEntry={isPasswordHidden}
                        placeholder='Password' value={passwordConfirm}
                        onChangeText={setPasswordConfirm}/>
                </ThemedInputContainer>
                <View style={{marginTop: spacing.gap}}>
                    <ArrowButton label='save and log in' theme={theme}
                        disabled={!password || !passwordConfirm}
                        onPress={async () => {
                            const token = await handleSubmit({password, passwordConfirm}, MOCK_RESET_TOKEN, setErrors);
                            if (!!token)
                                signIn(token); // sign in
                        }}/>
                </View>
            </ScrollableSection>
            <StripeBand ink={theme.ink} background={theme.card} style={{ position: 'absolute', left: 0, right: 0, bottom: 0}} />
        </PageContainer>
    );
}
