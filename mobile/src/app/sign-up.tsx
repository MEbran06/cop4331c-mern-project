import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, Theme, spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/theme';
import { ArrowButton, EyeButton } from '@/components/ThemedButton';
import { useRouter } from 'expo-router';
import { ButtonHeader } from '@/components/ButtonHeader';
import { HardShadow } from '@/components/decor';
import { useState, useMemo } from 'react';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import * as z from 'zod';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedDisplayTitle, ThemedInputContainer, ThemedText, ThemedTextInput } from '@/components/ThemedInputs';
import { PageContainer } from '@/components/PageContainer';
import { ApiRequest } from '@events/api';
import { useApi } from '@/hooks/useApi';
import { useSession } from '@/contexts/ctx';

const signUpFormSchema = z.object({
    role: z.enum(['club', 'student']),
    name: z.string().min(1, {message: 'Name is required'}),
    email: z.string().min(1, {message: 'Email is required'}).email({message: "Invalid email address"}),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

async function handleSubmit(data: {role: string, name: string, email: string, password: string}, 
    setErrors: CallableFunction,
    setSignUpError: (val?:string)=>void,
    api: ApiRequest): Promise<string>{
    setSignUpError(undefined); // clear the last attempt's error
    const result = signUpFormSchema.safeParse(data);
    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return '';
    }
    setErrors({});

    const res = await api<{ token: string }>('users', { method: 'POST', body: result.data });
    if (!res.ok) {
        setSignUpError(res.error); 
        return '';
    }
    if (!res.data) {
        setSignUpError("token not received")
        return '';
    }
    return res.data.token;
}

export default function SignUp() {
    const { theme } = useTheme();
    const styles = useMemo(() => stylesGen(theme), [theme]);
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    // keys match the schema fields, so "name" (not fullName)
    const [errors, setErrors] = useState<{name?: string[], email?: string[], password?: string[]}>();
    const [signUpErrors, setSignUpErrors] = useState<string>();
    const [submitting, setSubmitting] = useState(false);
    const [role, setRole] = useState<'student'|'club'>('student');
    const api = useApi();
    const {signIn} = useSession();
    return (
        <PageContainer>
        <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}>
            <Text>step 1 of 2</Text>
        </ButtonHeader>

        <ScrollableSection>
        <ThemedDisplayTitle fontSize={48} text='create your' highlight='account' theme={theme}/>

        <View style={{marginTop:spacing.gap}}>
            <ThemedText outerStyle={{justifyContent:"flex-start"}} text="I'm signing up as" theme={theme}/>
            <View style={{flexDirection:'row', gap: 12}}>
            <RoleCard
                title="Student"
                description='Follow clubs and see their events'
                selected={role === 'student'}       // true or false, computed by the parent
                onPress={() => setRole('student')}  // what to do when tapped
                theme={theme}
                icon='person-outline'
            />
            <RoleCard
                title="Club"
                description='Post events and receive feedback'
                selected={role === 'club'}
                onPress={() => setRole('club')}
                theme={theme}
                icon='megaphone-outline'
            />
            </View>
        </View>

        <View style={{marginTop:spacing.gap}}>
            <ThemedInputContainer theme={theme} label='full name' error={errors?.name?.at(0)}>
                <ThemedTextInput placeholder='John Doe' value={fullName} onChangeText={setFullName} theme={theme}/>
            </ThemedInputContainer>
            <ThemedInputContainer theme={theme} 
                label='university email' 
                error={errors?.email?.at(0)}
                hint="Use your school email. We'll send a code to confirm you're a student.">
                <ThemedTextInput autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder='you@university.edu' value={email} onChangeText={setEmail} theme={theme}/>
            </ThemedInputContainer>
            <ThemedInputContainer theme={theme} 
                    label='password'
                    error={errors?.password?.at(0)}>
                <ThemedTextInput theme={theme} 
                    secureTextEntry={isPasswordHidden} 
                    placeholder='Password' value={password} 
                    onChangeText={setPassword}
                    right={<EyeButton theme={theme} toggle={isPasswordHidden} onPress={() => setPasswordHidden(!isPasswordHidden)}/>}/>
            </ThemedInputContainer>
            {!!signUpErrors && <Text style={styles.fieldError}>*{signUpErrors}</Text>}
        </View>
        </ScrollableSection>

        <View style={styles.footer}>
            <View style={{marginHorizontal: 20, marginBottom: 5}}>
                <ArrowButton loading={submitting} onPress={async () => {
                    setSubmitting(true);
                    try {
                        const token = await handleSubmit({role, name: fullName, email, password}, setErrors, setSignUpErrors, api);
                        // signing in switches the stack to the user's tabs
                        if (token) await signIn(token);
                        // TODO: verify once the backend sends the code
                        // router.push({ pathname: '/verify', params: { email: email } });
                    } catch {
                        // the request itself failed (no connection, server down)
                        setSignUpErrors('Could not reach the server. Try again.');
                    } finally {
                        setSubmitting(false); // always runs, even if the request throws
                    }
                }} direction='forward' label='create account' theme={theme}></ArrowButton>
            </View>
            <ThemedText text='have an account?' 
                        theme={theme} link='log in'
                        onLinkPress={()=>router.back()}/>
        </View>
        </PageContainer>
    );
}

interface RoleCardProps {
    onPress: () => void,
    selected: boolean,
    title: string,
    description: string,
    theme: Theme,
    icon: React.ComponentProps<typeof Ionicons>['name']
}

function RoleCard({onPress, selected, title, theme, description, icon}: RoleCardProps) {
    const border = selected ? theme.borderWidth + 1 : theme.borderWidth;
    return (
        <HardShadow style={{flex: 1}} color={selected ? theme.ink : 'transparent' }>
        <Pressable onPress={onPress}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${title}.${description}`}
            style={{
                minHeight: 108,
                gap: 6,
                backgroundColor: selected ? theme.hi : theme.card,
                borderWidth: border,
                borderColor: theme.ink,
                padding: 15 - border, // thicker border, less padding: content stays in place
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Ionicons name={icon} size={26} color={selected ? theme.onHi : theme.ink} />
            {/* radio circle */}
            <View style={{
                width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: theme.ink,
                backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center',
            }}>
                {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.ink }} />}
            </View>
            </View>
            <Text style={{ fontFamily: fonts.label, fontSize: 19, letterSpacing: 0.8, color: selected ? theme.onHi : theme.ink }}>
            {title.toUpperCase()}
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 17.5, color: selected ? theme.onHi : theme.ink }}>
            {description}
            </Text>

        </Pressable>
        </HardShadow>
    );
}

const stylesGen = (theme: Theme) => StyleSheet.create({
    DisplayText: {
        fontFamily: fonts.display, 
        fontSize: 48, 
        textTransform: 'uppercase'
    },
    // same as the login error on sign-in
    fieldError: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.primaryText,
        marginTop: 6,
    },
    footer: {
        borderTopWidth: 3, 
        borderColor: theme.ink,
        paddingVertical: 20, 
        backgroundColor: theme.card, 
        marginHorizontal: -20, 
        marginBottom:-20
    },
});

