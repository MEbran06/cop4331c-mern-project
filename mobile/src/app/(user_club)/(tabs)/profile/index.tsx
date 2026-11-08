import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSession } from '@/contexts/ctx';
import { useTheme } from '@/contexts/theme';
import { useCallback, useMemo, useState } from 'react';
import { fonts, spacing, Theme } from '@/constants/theme';
import { PageContainer } from '@/components/PageContainer';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { ClubProfile, fetchClubFollowers, fetchClubProfile, Follower } from '@/utils/profiles';
import { useFocusEffect, useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { ScrollableSection } from '@/components/ScrollableSection';
import { DotGrid, HardShadow } from '@/components/decor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedBox } from '@/components/ThemedBox';
import { getInitials } from '@/components/clubRow';
import { EditProfileButton, IconButton } from '@/components/ThemedButton';
import { SettingsRow } from '@/components/SettingsRow';
import { FollowerRow } from '@/components/FollowerRow';
import Feather from '@react-native-vector-icons/feather';
import { ApiRequest } from '@events/api';
import * as z from 'zod';

const FOLLOWER_PREVIEW = 5; // how many followers the profile shows before "see all"

//any letter
const HAS_LETTER = /\p{L}/u;

const editProfileSchema = z.object({
    name: z.string().trim()
        .min(1, 'Name is required')
        .regex(HAS_LETTER, 'Name needs at least one letter'),
    description: z.string().trim(),
});

type EditProfileErrors = { name?: string[], description?: string[] };

async function handleSaveEdit(
    data:{name:string,description:string},
    userId: string,
    api: ApiRequest,
    setErrors: (errors: EditProfileErrors | undefined) => void): Promise<boolean> {

    const result = editProfileSchema.safeParse(data);
    if (!result.success) {
        setErrors(result.error.flatten().fieldErrors);
        return false;
    }
    setErrors(undefined);

    // TODO: call api to do the edit profile, sending result.data (trimmed values)
    return true;
}

export default function ClubProfilePage() {
    const { theme } = useTheme();
    const style = useMemo(() => styleGen(theme), [theme]);
    const {signOut, user} = useSession();
    const [profile, SetProfile] = useState<ClubProfile>();
    const [followers, SetFollowers] = useState<Follower[]>();
    const [followerTotal, setFollowerTotal] = useState(0);
    const [error, setError] = useState<string>();
    const router = useRouter();
    const api = useApi();
    const insets = useSafeAreaInsets();
    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [draftDescription, setDraftDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editErrors, setEditErrors] = useState<EditProfileErrors>();

  
      useFocusEffect(useCallback(()=>{
  
          let active = true;
  
          if (!user) 
              return ()=>{active=false;};
  
          // make call to api to fetch user profile
          fetchClubProfile(user.id, api).then((profile)=>{
              if (!active) return;
              SetProfile(profile);
          }).catch(() => { if (active) setError("User profile not found.") });
  
          // only preview
          fetchClubFollowers(user.id, api, { limit: FOLLOWER_PREVIEW }).then((page)=>{
              if (!active) return;
              SetFollowers(page.followers);
              setFollowerTotal(page.total);
          }).catch(() => {}); 

          return ()=>{active=false;};
  
      }, [user, api]));
  
      // no profile and no error means it's still loading
      if (!profile && !error) {
          return (
              <PageContainer>
                  <ActivityIndicator style={{ marginTop: 40 }} color={theme.ink}/>
              </PageContainer>
          );
      }

      if (!profile) {
          return (
              <PageContainer>
                  <ThemedDisplayTitle fontSize={48} theme={theme} text="profile not" highlight="found"/>
                  <Text style={style.notFoundText}>
                      {error}
                  </Text>
              </PageContainer>
          );
      }

      return (
        <PageContainer>
            <ScrollableSection>
                <HardShadow color={theme.ink} >
                <View style={{
                    borderWidth: theme.borderWidth,
                    borderColor: theme.ink,
                    backgroundColor: theme.card,
                }}>
                    <View style={{ backgroundColor: theme.hi, 
                    paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: 16,
                    borderBottomWidth: theme.borderWidth, borderBottomColor: theme.ink }}>
                        <View style={{
                            position:"absolute", top:0, right:0, padding: 10
                        }}>
                            <DotGrid color={theme.onHi}/>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom }}>
                        <View style={{ alignItems: "flex-start", marginTop: -45 }}>
                            <ThemedBox color={theme.ink} text={getInitials(profile.name)} size={90} theme={theme}/>
                        </View>
                        <ThemedDisplayTitle 
                            fontSize={40} text={isEditing ? draftName : profile.name} 
                            onChangeText={setDraftName}
                            theme={theme}
                            editable={isEditing}/>
                        {isEditing && !!editErrors?.name &&
                            <Text style={style.fieldError}>*{editErrors.name[0]}</Text>
                        }
                        {(isEditing || !!profile.description) && 
                            <View style={{
                                marginBottom: spacing.gap,
                                marginTop: 5
                            }}>
                                {isEditing ? 
                                    <TextInput style={{
                                            backgroundColor: theme.paper,
                                            fontFamily: fonts.body,
                                            color:theme.muted,
                                            fontSize: 15,
                                            borderWidth: theme.borderWidth,
                                            padding: 5,
                                            minHeight: 10

                                        }}
                                        value={draftDescription} 
                                        onChangeText={setDraftDescription}
                                        multiline/>
                                        
                                : <Text style={{
                                    fontFamily: fonts.body,
                                    color: theme.muted,
                                    fontSize: 15

                                }}>{profile.description}</Text>}
                                {isEditing && !!editErrors?.description &&
                                    <Text style={style.fieldError}>*{editErrors.description[0]}</Text>
                                }
                            </View>
                        }
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <EditProfileButton loading={submitting} theme={theme} isEditing={isEditing} onPress={async()=>{
                                    if (isEditing) {
                                        try
                                        {
                                            setSubmitting(true);
                                            const saved = await handleSaveEdit({name: draftName, description: draftDescription},
                                                profile.id, api, setEditErrors);
                                            if (saved) setIsEditing(false); // on failure, stay in edit mode so they can fix it
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    } else {
                                        // only copy the saved values in when *entering* edit mode
                                        setDraftName(profile.name);
                                        setDraftDescription(profile.description ?? '');
                                        setIsEditing(true);
                                    }

                                }}/>
                            </View>
                            {isEditing &&
                                <IconButton 
                                    icon={(color) => <Feather name="x" size={22} color={color}/>} 
                                    theme={theme}
                                    accessibilityLabel='Cancel editing'
                                    onPress={()=>{
                                        setIsEditing(false);
                                        setEditErrors(undefined);
                                    }}
                                    disabled={submitting}
                                    />
                            }
                        </View>

                    </View>
                </View>
                </HardShadow>

                {!!followers &&
                    <View>
                        <Text style={style.sectionLabel}>
                            FOLLOWERS · {followerTotal}
                        </Text>
                    </View>
                }

                {!!followers && followers.length > 0 &&
                    <HardShadow color={theme.ink}>
                        <View style={style.list}>
                            {followers.map((follower, index) => (
                                <FollowerRow key={follower.id} theme={theme} follower={follower} index={index}
                                    style={index > 0 && style.divider}/>
                            ))}

                            {followerTotal > followers.length &&
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`See all ${followerTotal} followers`}
                                    onPress={() => router.push('/profile/followers')}
                                    style={({ pressed }) => [style.divider, style.seeAll, pressed && { backgroundColor: theme.paper }]}>
                                    <Text style={style.seeAllText}>see all {followerTotal} followers</Text>
                                    <Feather name="arrow-right" size={18} color={theme.ink}/>
                                </Pressable>
                            }
                        </View>
                    </HardShadow>
                }
                <Text style={style.sectionLabel}>settings</Text>
                <HardShadow color={theme.ink}>
                    <View style={{ borderWidth: theme.borderWidth, borderColor: theme.ink }}>
                        <SettingsRow theme={theme} icon="sun"
                            title="Display & accessibility"
                            subtitle="Color theme, text size, fonts"
                            onPress={() => router.push('/preferences')}/>
                        <SettingsRow 
                            theme={theme} icon='lock'
                            title='Change password'
                            style={{ borderTopWidth: theme.borderWidth, borderTopColor: theme.ink }}
                            onPress={()=>router.push('/change-password')}/>
                        <SettingsRow 
                            theme={theme} icon='log-out'
                            title='Sign Out'
                            style={{ borderTopWidth: theme.borderWidth, borderTopColor: theme.ink }}
                            onPress={()=>signOut()}/>
                    </View>
                </HardShadow>
            </ScrollableSection>
        </PageContainer>
      );
}


const styleGen = (theme: Theme) => StyleSheet.create({
    fieldError: { // same look as ThemedInputContainer's error
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.primaryText,
        marginTop: 6,
    },
     notFoundText: {
        fontFamily: fonts.body,
        fontSize: 15,
        lineHeight: 21,
        color: theme.muted,
        marginTop: 10
    },
    sectionLabel: {
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted,
        marginTop: spacing.gap,
        marginBottom: 8
    },
    listShadow: {
        marginBottom: 40 // room above the tab bar at the end of the scroll
    },
    list: {
        borderWidth: theme.borderWidth,
        borderColor: theme.ink,
        backgroundColor: theme.card
    },
    divider: {
        borderTopWidth: theme.borderWidth,
        borderTopColor: theme.ink
    },
    seeAll: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 52,
        backgroundColor: theme.card
    },
    seeAllText: {
        fontFamily: fonts.label,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.ink
    }
});