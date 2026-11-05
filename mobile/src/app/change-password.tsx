import { ButtonHeader } from "@/components/ButtonHeader";
import { PageContainer } from "@/components/PageContainer";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/contexts/theme";
import { ScrollableSection } from "@/components/ScrollableSection";
import { ThemedDisplayTitle, ThemedInputContainer, ThemedTextInput } from "@/components/ThemedInputs";
import { fonts, spacing, Theme } from "@/constants/theme";
import { useMemo, useState } from "react";
import { ArrowButton, EyeButton } from "@/components/ThemedButton";
import * as z from 'zod';
import { StripeBand } from "@/components/decor";
import { ApiRequest } from "@events/api";
import { useApi } from "@/hooks/useApi";

const newPasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Enter your current password'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'] // show the error under the confirm field
});

async function handleSubmit(
    data: {oldPassword: string, password: string, passwordConfirm: string},
    setErrors: CallableFunction,
    api: ApiRequest): Promise<boolean> {
    const result = newPasswordSchema.safeParse(data);
    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return false;
    }
    setErrors(undefined);
    
    // TODO: replace with actual backend call
    return true;
    
}

export default function ChangePassword() {
    const { theme } = useTheme();
    const router = useRouter();
    const api = useApi();
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [password, setPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState<{password?: string[], 
                                          passwordConfirm?: string[],
                                          oldPassword?: string[]}>();
    const styles = useMemo(() => stylesGen(theme), [theme]);

    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}/>
            <ScrollableSection>
                <ThemedDisplayTitle fontSize={54} theme={theme} text="set a new" highlight='password'/>
                <Text style={{color: theme.muted, fontFamily: fonts.body, marginTop: 10}}>
                    Enter your current password, then choose a new one.
                </Text>
                <ThemedInputContainer style={{marginTop:spacing.gap}} 
                    theme={theme} label="old password" 
                    error={errors?.oldPassword?.at(0)}
                    labelRight={<Text style={styles.forgotLink} onPress={()=>router.navigate('/forgot-password-start')}>FORGOT?</Text>}>
                    <ThemedTextInput theme={theme}
                        secureTextEntry={isPasswordHidden}
                        placeholder='Password' value={oldPassword}
                        onChangeText={setOldPassword}
                        right={<EyeButton theme={theme} toggle={isPasswordHidden} onPress={() => setPasswordHidden(!isPasswordHidden)}/>}/>
                </ThemedInputContainer>
                <ThemedInputContainer style={{marginTop:spacing.gap}} theme={theme} label="new password" error={errors?.password?.at(0)}>
                    <ThemedTextInput theme={theme}
                        secureTextEntry={isPasswordHidden}
                        placeholder='Password' value={password}
                        onChangeText={setPassword}/>
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
                        disabled={!oldPassword || !password || !passwordConfirm}
                        onPress={async () => {
                            setSubmitting(true);
                            try{
                                const success = await handleSubmit({oldPassword,password, passwordConfirm},setErrors, api);
                                if (success) {
                                    router.back();
                                }
                            } finally {
                                setSubmitting(false)
                            }
                        }}/>
                </View>
            </ScrollableSection>
            <StripeBand ink={theme.ink} background={theme.card} style={{ position: 'absolute', left: 0, right: 0, bottom: 0}} />
        </PageContainer>
    );
}

const stylesGen = (theme: Theme) => StyleSheet.create({
    forgotLink: {
        fontFamily: fonts.label,  
        borderBottomWidth: 3,
        letterSpacing: 1,
        paddingTop: 5,
        marginBottom: 5,
        color: theme.ink, 
        borderBottomColor: theme.ink, 
        marginRight: 15
    }
});