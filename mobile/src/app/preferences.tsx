import { PageContainer } from '@/components/PageContainer';
import { ButtonHeader } from '@/components/ButtonHeader';
import { useRouter } from 'expo-router';
import { DotGrid, HardShadow } from '@/components/decor';
import { ThemedDisplayTitle } from '@/components/ThemedInputs';
import { useTheme } from '@/contexts/theme';
import { fonts, spacing, Theme, ThemeName, themes } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { EventCard } from '@/components/EventCard';
import { ClubEvent } from '@/utils/events';
import { ScrollableSection } from '@/components/ScrollableSection';

const THEME_OPTIONS: { name: ThemeName, label: string, subtitle: string }[] = [
    { name: 'retro',     label: 'Retro',         subtitle: 'Black, yellow and orange. The default look.' },
    { name: 'colorsafe', label: 'Color-safe',    subtitle: 'Blue and orange, clear for most color vision types' },
    { name: 'contrast',  label: 'High contrast', subtitle: 'Black, white and yellow' },
    { name: 'mono',      label: 'Grayscale',     subtitle: 'No color at all' },
];

const HOUR = 60 * 60 * 1000;

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * HOUR).toISOString();
}

const MOCK_EVENT: ClubEvent = {
    // ended last night, survey open and not answered yet -> shows the survey button
    id: 'evt-2',
    title: 'Movie Night',
    club: {
        id: 'club-film',
        name: 'Film Society',
        followers: 48,
        isFollowing: true,
        description: 'Screenings, discussions and the occasional student short. Popcorn is always on us.',
    },
    startsAt: hoursFromNow(-20),
    endsAt: hoursFromNow(-17),
    location: 'Student Union Theater',
    description: 'Our October throwback screening. Free popcorn while it lasts, and bring a friend. Doors open 15 minutes before the film starts.',
    survey: {
      id: 'srv-1',
      title: 'How was Movie Night?',
      status: 'open',
      closesAt: hoursFromNow(48),
      completed: false,
      questions: [
        {
          id: 'q-1-1',
          text: 'How would you rate the screening?',
          type: 'single_choice',
          options: ['Loved it', 'Liked it', 'It was okay', 'Not for me'],
          required: true,
        },
        {
          id: 'q-1-2',
          text: 'What should we screen next?',
          type: 'multiple_choice',
          options: ['Classic comedies', 'Sci-fi', 'Horror', 'Animated', 'Documentaries'],
          required: false,
        },
        {
          id: 'q-1-3',
          text: 'Anything we could do better?',
          type: 'text',
          options: [],
          required: false,
        },
      ],
    },
  }


export default function Preferences() {
    const router = useRouter();
    const {theme, themeName, setThemeName} = useTheme();
    const style = useMemo(() => styleGen(theme), [theme]);

    return (
        <PageContainer>
            <ButtonHeader onAction={() => router.back()} buttonType='arrow-left' theme={theme}>
                <DotGrid color={theme.ink}/>
            </ButtonHeader>
            <ScrollableSection>
            <ThemedDisplayTitle fontSize={48} text='display &' highlight='accessibility' theme={theme}/>
            <Text style={style.sectionLabel}>color theme</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
                {THEME_OPTIONS.map((option) => (
                    <ThemeCard key={option.name} {...option}
                        selected={option.name === themeName}
                        onPress={() => setThemeName(option.name)}
                        themeName={option.name}
                        label={option.label}/>
                ))}
            </View>
            <Text style={style.sectionLabel}>preview</Text>
            <EventCard theme={theme} event={MOCK_EVENT} onPress={()=>null}/>
            </ScrollableSection>
        </PageContainer>
    );
}

interface ThemeCardProps {
    themeName: ThemeName,
    label: string,
    subtitle: string,
    selected: boolean,
    onPress: ()=>void
}

function ThemeCard({themeName, label, subtitle, selected, onPress}:ThemeCardProps) {
    const {theme} = useTheme();
    const border = selected ? theme.borderWidth + 1 : theme.borderWidth;
    const swatch = themes[themeName];

    return (
        <HardShadow color={selected ? theme.ink : 'transparent'} style={{ flexBasis: '45%', flexGrow: 1 }}>
            <Pressable
                onPress={onPress}
                accessibilityRole='radio'
                accessibilityState={{
                    checked: selected
                }}
                accessibilityLabel={label}
                style={{
                    flexGrow: 1,
                    minHeight: 108,
                    gap: 6,
                    backgroundColor: selected ? theme.hi : theme.card,
                    borderWidth: border,
                    borderColor: theme.ink,
                    padding: 15 - border
                }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', borderWidth: 2, borderColor: theme.ink, alignSelf: 'flex-start' }}>
                        {[swatch.s1, swatch.s2, swatch.s3].map((color) => (
                            <View key={color} style={{ width: 20, height: 16, backgroundColor: color }}/>
                        ))}
                    </View>
                    {/* radio circle */}
                    <View style={{
                        width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: theme.ink,
                        backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center',
                    }}>
                        {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.ink }} />}
                    </View>
                </View>
                <Text style={{ fontFamily: fonts.label, fontSize: 19, letterSpacing: 0.8, color: selected ? theme.onHi : theme.ink }}>
                    {label.toUpperCase()}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 17.5, color: selected ? theme.onHi : theme.ink }}>
                    {subtitle}
                </Text>
            </Pressable>
        </HardShadow>
    );
}

const styleGen = (theme: Theme) => StyleSheet.create({
    sectionLabel: {
        fontFamily: fonts.label,
        fontSize: 13,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.muted,
        marginTop: spacing.gap,
        marginBottom: 8
    }
});