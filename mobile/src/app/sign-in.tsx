import { StyleSheet, View, Text } from 'react-native';
import {useState, useMemo } from 'react'
import {ArrowButton, EyeButton} from '@/components/ThemedButton'
import { DotGrid, CornerSquares,  StripeBand } from '@/components/decor';
import { fonts, Theme } from '@/constants/theme';
import { useSession } from '@/contexts/ctx';
import { useRouter } from 'expo-router';
import * as z from 'zod';
import { useTheme } from '@/contexts/theme';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedDisplayTitle, ThemedInputContainer, ThemedText, ThemedTextInput } from '@/components/ThemedInputs';
import { PageContainer } from '@/components/PageContainer';
import { ApiRequest } from '@events/api';
import { useApi } from '@/hooks/useApi';


const loginFormSchema = z.object({
    email: z.string().min(1, {message: 'Email is required'}).email({message: "Invalid email address"}),
    password: z.string().min(1, 'Password is required')
});

async function handleSubmit(
    data: {email: string,  password: string}, 
    setErrors: CallableFunction,
    SetLoginError: (val?:string)=>void,
    api: ApiRequest): Promise<string> {
    
    setErrors(undefined);
    SetLoginError(undefined);

    const result = loginFormSchema.safeParse(data);

    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return '';
    }
    
    const res = await api<{ token: string }>('auth/login', { method: 'POST', body: result.data });
    if (!res.ok) {
        SetLoginError(res.error); 
        return '';
    }
    if (res.data)
        return res.data.token;
    else {
        SetLoginError("token not received")
        return '';
    }


}

export default function SignIn() {
  const { theme } = useTheme();
  const styles = useMemo(() => stylesGen(theme), [theme]);
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string[], password?: string[]}>();
  const [loginError, SetLoginError] = useState<string>();
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const api = useApi();
  return (
    <PageContainer>
        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
            <DotGrid color={theme.ink} />
            <CornerSquares accent={theme.s3} ink={theme.ink} />
        </View>
        <ScrollableSection>
        <ThemedDisplayTitle text='welcome' highlight='back!' theme={theme}/>
        <Text style={{color: theme.muted, fontFamily: fonts.body, marginTop: 10}}>
            Log in to see what your clubs are up to.
        </Text>
        <View style={{marginTop: 18}}>
            <ThemedInputContainer theme={theme} label='email' error={errors?.email?.at(0)}>
                <ThemedTextInput autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder='Email' value={email} onChangeText={setEmail} theme={theme}/>
            </ThemedInputContainer>
            <ThemedInputContainer theme={theme} 
                    label='password'
                    error={errors?.password?.at(0)} 
                    labelRight={<Text style={styles.forgotLink} onPress={()=>router.navigate('/forgot-password-start')}>FORGOT?</Text>}>
                <ThemedTextInput theme={theme} 
                    secureTextEntry={isPasswordHidden} 
                    placeholder='Password' value={password} 
                    onChangeText={setPassword}
                    right={<EyeButton theme={theme} toggle={isPasswordHidden} onPress={() => setPasswordHidden(!isPasswordHidden)}/>}/>
            </ThemedInputContainer>
            {!!loginError && <Text style={styles.fieldError}>*{loginError}</Text>}
            <View style={{marginTop: 20,}}>
            <ArrowButton label='Log In' theme={theme} loading={submitting}
                onPress={async () => {
                    setSubmitting(true);
                    try {
                        const token = await handleSubmit({email, password}, setErrors, SetLoginError, api);
                        if (token) signIn(token);
                    } finally {
                        setSubmitting(false);   // always runs, even if the request throws
                    }
                }}>
            </ArrowButton>
            </View>
        </View>
        </ScrollableSection>
        <ThemedText text='new here?' 
            theme={theme} link='create account'
            onLinkPress={()=>router.navigate('/sign-up')}/>
        <StripeBand ink={theme.ink} background={theme.card} style={{ position: 'absolute', left: 0, right: 0, bottom: 0}} />
    </PageContainer>
  );
}

const stylesGen = (theme: Theme) => StyleSheet.create({
    DisplayText: {
        fontFamily: fonts.display, 
        fontSize: 60, 
        textTransform: 'uppercase'
    },
    forgotLink: {
        fontFamily: fonts.label,  
        borderBottomWidth: 3,
        letterSpacing: 1,
        paddingTop: 5,
        marginBottom: 5,
        color: theme.ink, 
        borderBottomColor: theme.ink, 
        marginRight: 15
    },
    fieldError: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.primaryText,
        marginTop: 6,
    }

    
})
