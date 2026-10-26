import { TextInput, StyleSheet, View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {useState} from 'react'
import {ArrowButton} from '@/components/ThemedButton'
import { DotGrid, CornerSquares, Highlight } from '@/components/decor';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { themes, fonts } from '@/constants/theme';
import { StripeBand } from '@/components/decor';
import { useSession } from '@/contexts/ctx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as z from 'zod';
import { theme, isIOS } from './preferences';
// simulate for now since backend hasn't implemented it
import {simulateGenerateToken, UserPayload} from '@/utils/mockJwt'


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

    const token = await simulateGenerateToken(user);
    return token;
}

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email: string, password: string}>();
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.container, {paddingTop:insets.top, paddingBottom:insets.bottom}]}>
        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
            <DotGrid color={theme.ink} />
            <CornerSquares accent={theme.s3} ink={theme.ink} />
        </View>
        <KeyboardAvoidingView style={{flex: 1}} behavior={isIOS ? 'padding': undefined}>
        <ScrollView keyboardShouldPersistTaps='handled' alwaysBounceVertical={false} showsVerticalScrollIndicator={false}>
        <View style={{marginTop: 18}}>
            <Text style={styles.DisplayText}>WELCOME</Text>
            <Highlight background={theme.hi} textStyle={styles.DisplayText}>back!</Highlight>
            <Text style={{color: theme.muted, fontFamily: fonts.body}}>Log in to see what your clubs are up to.</Text>
        </View>
        <View style={{marginTop: 18}}>
            <Text style={styles.customText}>EMAIL</Text>
            <TextInput style={styles.input} placeholder='Email' value={email} onChangeText={setEmail}/>
            {errors && <Text style={styles.fieldError}>*{errors.email[0]}</Text>}
            <View style={{flexDirection: "row", justifyContent:"space-between", marginTop: 20}}>
                <Text style={styles.customText}>PASSWORD </Text>
                <Text style={[styles.linkText, {color: theme.ink, borderBottomColor: theme.ink, marginRight: 15}]} onPress={()=>null}>
                    FORGOT?
                </Text>
            </View>
            <View style={styles.passwordWrapper}>
                <TextInput style={{flex: 1, paddingHorizontal: 15}} secureTextEntry={isPasswordHidden} placeholder='Password' value={password} onChangeText={setPassword}/>
                <Pressable style={styles.hidePasswordButton} onPress={() => setPasswordHidden(!isPasswordHidden)}>
                    {isPasswordHidden ? <EyeIcon  /> : <EyeOffIcon />}
                </Pressable>
            </View>
            {errors && <Text style={styles.fieldError}>*{errors.password}</Text>}
            <View style={{marginTop: 20,}}>
            <ArrowButton label='Log In' theme={theme}
                onPress={async () => {
                    const token = await handleSubmit({email, password}, setErrors);
                    if (token) 
                        signIn(token); // token if successful
                }}>
            </ArrowButton>
            </View>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
        <View style={{flexDirection: "row", justifyContent:"center", marginTop: "auto", paddingBottom:30}}>
            <Text style={styles.customText}>NEW HERE? </Text>
            <Text style={styles.linkText} onPress={()=>router.navigate('/sign-up')}>
                CREATE ACCOUNT
            </Text>
        </View>
        <StripeBand ink={theme.ink} background={theme.card} style={{ position: 'absolute', left: 0, right: 0, bottom: 0}} />
    </View>
  );
}

const styles = StyleSheet.create({
    DisplayText: {
        fontFamily: fonts.display, 
        fontSize: 60, 
        textTransform: 'uppercase'
    },
    input: { 
        height: 54, 
        borderWidth: theme.borderWidth, 
        borderColor: theme.ink, 
        backgroundColor: theme.card, 
        fontFamily: fonts.body, 
        fontSize: 16,
        marginVertical: 4,
        paddingHorizontal: 15
    },
    container: { 
        flex: 1,
        paddingHorizontal: 20,
    },
    buttonText: {
        fontFamily: fonts.label,
        fontSize: 14,
        letterSpacing: 1.1
    },
    hidePasswordButton: {
        width: 52,
        borderLeftWidth: 4,
        justifyContent: "center",
        alignItems: "center"
    },
    passwordWrapper: {
        height: 54, 
        flexDirection:"row", 
        borderWidth: theme.borderWidth,
        backgroundColor: theme.card,
        marginTop: 10
    },
    linkText: {
        fontFamily: fonts.label, 
        color: theme.primaryText, 
        borderBottomWidth: 3,
        letterSpacing: 1,
        paddingTop: 5,
        marginBottom: 5,
        borderBottomColor: theme.primaryText
    },
    customText: {
        fontFamily: fonts.label,
        color: theme.ink,
        letterSpacing: 1,
        padding: 5
    },
    fieldError: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.primaryText,
        marginTop: 6,
    },

    
})
