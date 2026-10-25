import { TextInput, StyleSheet, View, Text, Pressable } from 'react-native';
import {useState} from 'react'
import {ArrowButton} from '@/components/ArrowButton'
import { DotGrid, CornerSquares, Highlight } from '@/components/decor';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { themes, fonts } from '@/constants/theme';
import { StripeBand } from '@/components/decor';
import { useSession } from '@/contexts/ctx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// simulate for now since backend hasn't implemented it
import {simulateGenerateToken, UserPayload} from '@/utils/mockJwt'

const theme = themes.retro;

async function handleSubmit(username: string, password: string): Promise<string> {
    const user: UserPayload = {
        id: '1',
        username: username,
        role: "club"
    };

    const token = await simulateGenerateToken(user);
    return token;
}

export default function SignIn() {
  const { signIn } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setPasswordHidden] = useState(true);
  const insets = useSafeAreaInsets();
  return (
    <View style={{...styles.container, paddingTop:insets.top, paddingBottom:insets.bottom}}>
        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
            <DotGrid color={theme.ink} />
            <CornerSquares accent={theme.s3} ink={theme.ink} />
        </View>
        <View style={{marginTop: 18}}>
            <Text style={styles.DisplayText}>WELCOME</Text>
            <Highlight background={theme.hi} textStyle={styles.DisplayText}>back!</Highlight>
            <Text style={{color: theme.muted, fontFamily: fonts.body}}>Log in to see what your clubs are up to.</Text>
        </View>
        <View style={{marginTop: 18}}>
            <Text style={styles.customText}>USERNAME</Text>
            <TextInput style={styles.input} placeholder='Username' value={username} onChangeText={setUsername}/>
            <View style={{flexDirection: "row", justifyContent:"space-between", marginTop: 20}}>
                <Text style={styles.customText}>PASSWORD </Text>
                <Text style={{...styles.linkText, color: theme.ink, borderBottomColor: theme.ink, marginRight: 15}} onPress={()=>null}>
                    FORGOT?
                </Text>
            </View>
            <View style={styles.passwordWrapper}>
                <TextInput style={{flex: 1, paddingHorizontal: 15}} secureTextEntry={isPasswordHidden} placeholder='Password' value={password} onChangeText={setPassword}/>
                <Pressable style={styles.hidePasswordButton} onPress={() => setPasswordHidden(!isPasswordHidden)}>
                    {isPasswordHidden ? <EyeIcon  /> : <EyeOffIcon />}
                </Pressable>
            </View>
            <ArrowButton label='Log In' theme={theme}
                onPress={async () => {
                    const tok = await handleSubmit(username, password);
                    signIn(tok);
                }}>
            </ArrowButton>
        </View>
        <View style={{flexDirection: "row", justifyContent:"center", marginTop: "auto", paddingBottom:30}}>
            <Text style={styles.customText}>NEW HERE? </Text>
            <Text style={styles.linkText} onPress={()=>null}>
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
        marginBottom: 20,
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
    }
    
})
