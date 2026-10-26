import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { themes, fonts, Theme, spacing } from '@/constants/theme';
import { theme, isIOS } from './preferences';
import { ArrowButton, IconButton } from '@/components/ThemedButton';
import { ImperativeRouter, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ButtonHeader } from '@/components/ButtonHeader';
import { HardShadow, Highlight } from '@/components/decor';
import { useState } from 'react';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import * as z from 'zod';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

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

        <KeyboardAvoidingView style={{flex: 1}} behavior={isIOS ? 'padding': undefined}>
        <ScrollView keyboardShouldPersistTaps='handled' alwaysBounceVertical={false} showsVerticalScrollIndicator={false}>  
        <View style={{marginTop: spacing.gap}}>
            <Text style={styles.DisplayText}>create your</Text>
            <Highlight background={theme.hi} textStyle={styles.DisplayText}>account</Highlight>
        </View>

        <View style={{marginTop:spacing.gap}}>
            <Text style={styles.customText}>I'm signing up as</Text>
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
            <Text style={styles.customText}>full name</Text>
            <TextInput style={styles.input} placeholder='John Doe' value={fullName} onChangeText={setFullName}/>
            {errors?.fullName && <Text style={styles.fieldError}>*{errors.fullName[0]}</Text>}
            <Text style={styles.customText}>university email</Text>
            <TextInput style={styles.input} placeholder='you@university.edu' value={email} onChangeText={setEmail}/>
            <Text style={styles.customTextBody}>Use your school email. We'll send a code to confirm you're a student.</Text>
            {errors?.email && <Text style={styles.fieldError}>*{errors.email[0]}</Text>}
            <Text style={[styles.customText, {marginTop: 10}]}>password</Text>
            <View style={styles.passwordWrapper}>
                <TextInput style={{flex: 1, paddingHorizontal: 15}} secureTextEntry={isPasswordHidden} placeholder='Password' value={password} onChangeText={setPassword}/>
                <Pressable style={styles.hidePasswordButton} onPress={() => setPasswordHidden(!isPasswordHidden)}>
                    {isPasswordHidden ? <EyeIcon  /> : <EyeOffIcon />}
                </Pressable>
            </View>
            {errors?.password && <Text style={styles.fieldError}>*{errors.password[0]}</Text>}
        </View>
        </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.footer}>
            <View style={{marginHorizontal: 20}}>
                <ArrowButton onPress={async () => {
                    await handleSubmit({role, fullName, email, password}, setErrors, router);
                }} direction='forward' label='create account' theme={theme}></ArrowButton>
            </View>
            <View style={{flexDirection: "row", justifyContent:"center", marginTop: "auto", paddingBottom:30}}>
                <Text style={styles.customText}>have an account? </Text>
                <Text style={styles.linkText} onPress={()=>router.back()}>
                    log in
                </Text>
            </View>
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
    customText: {
        fontFamily: fonts.label,
        color: theme.ink,
        letterSpacing: 1,
        padding: 5,
        textTransform: "uppercase"
    },
    customTextBody: {
        fontFamily: fonts.body,
        color: theme.muted
    },
    input: { 
        height: 54, 
        borderWidth: theme.borderWidth, 
        borderColor: theme.ink, 
        backgroundColor: theme.card, 
        fontFamily: fonts.body, 
        fontSize: 16,
        marginTop: 4,
        marginBottom: 8,
        paddingHorizontal: 15
    },
    linkText: {
        fontFamily: fonts.label, 
        color: theme.primaryText, 
        borderBottomWidth: 3,
        letterSpacing: 1,
        paddingTop: 5,
        marginBottom: 5,
        borderBottomColor: theme.primaryText,
        textTransform: "uppercase"
    },
    footer: {
        marginTop:spacing.gap, 
        borderTopWidth: 3, 
        borderColor: theme.ink,
        paddingTop: 20, 
        backgroundColor: theme.card, 
        marginHorizontal: -20, 
        marginBottom:-20
    },
    fieldError: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.primaryText,
        marginTop: 6,
    },
    passwordWrapper: {
        height: 54, 
        flexDirection:"row", 
        borderWidth: theme.borderWidth,
        backgroundColor: theme.card,
        marginTop: 10
    },
    hidePasswordButton: {
        width: 52,
        borderLeftWidth: 4,
        justifyContent: "center",
        alignItems: "center"
    },
});

