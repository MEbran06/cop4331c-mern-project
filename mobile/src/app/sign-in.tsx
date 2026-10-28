import { StyleSheet, View, Text } from 'react-native';
import {useState} from 'react'
import {ArrowButton, EyeButton} from '@/components/ThemedButton'
import { DotGrid, CornerSquares, Highlight } from '@/components/decor';
import { fonts, spacing } from '@/constants/theme';
import { StripeBand } from '@/components/decor';
import { useSession } from '@/contexts/ctx';
import { useRouter } from 'expo-router';
import * as z from 'zod';
import { theme } from './preferences';
// simulate for now since backend hasn't implemented it
import {simulateGenerateToken, UserPayload} from '@/utils/mockJwt'
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedDisplayTitle, ThemedInputContainer, ThemedText, ThemedTextInput } from '@/components/ThemedInputs';
import { PageContainer } from '@/components/PageContainer';


const loginFormSchema = z.object({
    email: z.string().min(1, {message: 'Email is required'}).email({message: "Invalid email address"}),
    password: z.string().min(1, 'Password is required')
});

async function handleSubmit(data: {email: string,  password: string}, setErrors: CallableFunction): Promise<string> {
    const result = loginFormSchema.safeParse(data);
    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return '';
    }
    const user: UserPayload = {
        id: '1',
        email: data.email,
        role: "club"
    };
    // replace with call to backend
    const token = await simulateGenerateToken(user);
    return token;
}

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string[], password?: string[]}>();
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const router = useRouter();
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
                <ThemedTextInput placeholder='Email' value={email} onChangeText={setEmail} theme={theme}/>
            </ThemedInputContainer>
            <ThemedInputContainer theme={theme} 
                    label='password'
                    error={errors?.password?.at(0)} 
                    labelRight={<Text style={styles.forgotLink} onPress={()=>router.navigate('/forgot-password-start')}>FORGOT?</Text>}>
                <ThemedTextInput theme={theme} 
                    secureTextEntry={isPasswordHidden} 
                    placeholder='Password' value={password} 
                    onChangeText={setPassword}
                    right={<EyeButton toggle={isPasswordHidden} onPress={() => setPasswordHidden(!isPasswordHidden)}/>}/>
            </ThemedInputContainer>
            <View style={{marginTop: 20,}}>
            <ArrowButton label='Log In' theme={theme}
                onPress={async () => {
                    const token = await handleSubmit({email, password}, setErrors);
                    if (!!token) 
                        signIn(token); // sign in
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

const styles = StyleSheet.create({
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
    }

    
})
