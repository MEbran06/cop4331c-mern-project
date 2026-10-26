import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { themes, fonts, Theme, spacing } from '@/constants/theme';
import { theme, isIOS } from './preferences';
import { ArrowButton, EyeButton, IconButton } from '@/components/ThemedButton';
import { ImperativeRouter, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonHeader } from '@/components/ButtonHeader';
import { HardShadow, Highlight } from '@/components/decor';
import { useState } from 'react';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import * as z from 'zod';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { ScrollableSection } from '@/components/ScrollableSection';
import { ThemedInputContainer, ThemedText, ThemedTextInput } from '@/components/ThemedInputs';

const signUpFormSchema = z.object({
    fullName: z.string().min(1, {message: 'Name is required'}),
    email: z.string().min(1, {message: 'Email is required'}).email({message: "Invalid email address"}),
    password: z.string().min(1, 'Password is required')
});

async function handleSubmit(data: {role: string, fullName: string, email: string, password: string}, setErrors: CallableFunction, router: ImperativeRouter): Promise<void>{
    const result = signUpFormSchema.safeParse(data);
    if (!result.success) {
        const flat = result.error.flatten();
        setErrors(flat.fieldErrors);
        return ;
    }
    setErrors({});

    //TODO: call backend
    
    // send to verification
    router.push('/verify');
}

export default function SignUp() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isPasswordHidden, setPasswordHidden] = useState(true);
    const [errors, setErrors] = useState<{fullName?: string[], email?: string[], password?: string[]}>();
    const [role, setRole] = useState<'student'|'club'>('student');
    return (
        <View style={[styles.container, {paddingTop:insets.top, paddingBottom:insets.bottom}]}>
        <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}>
            <Text>step 1 of 2</Text>
        </ButtonHeader>

        <ScrollableSection>
        <View style={{marginTop: spacing.gap}}>
            <Text style={styles.DisplayText}>create your</Text>
            <Highlight background={theme.hi} textStyle={styles.DisplayText}>account</Highlight>
        </View>

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
            <ThemedInputContainer theme={theme} label='full name' error={errors?.fullName?.at(0)}>
                <ThemedTextInput placeholder='John Doe' value={fullName} onChangeText={setFullName} theme={theme}/>
            </ThemedInputContainer>
            <ThemedInputContainer theme={theme} 
                label='university email' 
                error={errors?.email?.at(0)}
                hint="Use your school email. We'll send a code to confirm you're a student.">
                <ThemedTextInput placeholder='you@university.edu' value={email} onChangeText={setEmail} theme={theme}/>
            </ThemedInputContainer>
            <ThemedInputContainer theme={theme} 
                    label='password'
                    error={errors?.password?.at(0)}>
                <ThemedTextInput theme={theme} 
                    secureTextEntry={isPasswordHidden} 
                    placeholder='Password' value={password} 
                    onChangeText={setPassword}
                    right={<EyeButton toggle={isPasswordHidden} onPress={() => setPasswordHidden(!isPasswordHidden)}/>}/>
            </ThemedInputContainer>
        </View>
        </ScrollableSection>  

        <View style={styles.footer}>
            <View style={{marginHorizontal: 20, marginBottom: 5}}>
                <ArrowButton onPress={async () => {
                    await handleSubmit({role, fullName, email, password}, setErrors, router);
                }} direction='forward' label='create account' theme={theme}></ArrowButton>
            </View>
            <ThemedText text='have an account?' 
                        theme={theme} link='log in'
                        onLinkPress={()=>router.back()}/>
        </View>
        </View>
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
    footer: {
        borderTopWidth: 3, 
        borderColor: theme.ink,
        paddingVertical: 20, 
        backgroundColor: theme.card, 
        marginHorizontal: -20, 
        marginBottom:-20
    },
});

