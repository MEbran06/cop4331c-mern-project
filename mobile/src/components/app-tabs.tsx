import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, Theme } from '@/constants/theme';
import { ReactNode, useMemo } from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { HardShadow } from './decor';

interface TabContainerProp {
    children: ReactNode,
    theme: Theme
}


export function TabContainer({ children, theme } : TabContainerProp) {
    return (
        <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <ThemedTabBar {...props} theme={theme} />}>
            {children}
        </Tabs>
    );
}


interface ThemedTabBarProp extends BottomTabBarProps {
    theme: Theme
}

function ThemedTabBar({ state, descriptors, emitter, navigateToTab, insets, theme } : ThemedTabBarProp) {
    const styles = useMemo(() => stylesGen(theme), [theme]);
    return (
        <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]} role="tablist">
            {state.routes.map((route, index) => {
                const focused = index === state.index;
                const { options } = descriptors[route.key];
                const label = options.title ?? route.name;
                const color = theme.ink;

                const onPress = () => {
                    // let screens react to the press before switching tabs
                    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!focused && !event.defaultPrevented) {
                        navigateToTab(route.key);
                    }
                };

                return (
                    // inactive tabs keep a transparent shadow and border so nothing shifts when switching
                    <HardShadow key={route.key} offset={3} color={focused ? theme.ink : 'transparent'} style={styles.tabSlot}>
                        <Pressable
                            onPress={onPress}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: focused }}
                            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                            style={[styles.tab, focused && styles.tabFocused]}
                        >
                            {options.tabBarIcon?.({ focused, color, size: 22 })}
                            <Text style={styles.label}>{label}</Text>
                        </Pressable>
                    </HardShadow>
                );
            })}
        </View>
    );
}

const stylesGen = (theme: Theme) => StyleSheet.create({
    bar: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 10,
        paddingHorizontal: 20,
        backgroundColor: theme.card,
        borderTopWidth: theme.borderWidth,
        borderTopColor: theme.ink,
        marginTop: -34
    },
    tabSlot: {
        flex: 1
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 8,
        borderWidth: theme.borderWidth,
        borderColor: 'transparent'
    },
    tabFocused: {
        backgroundColor: theme.hi,
        borderColor: theme.ink
    },
    label: {
        fontFamily: fonts.label,
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.ink
    }
});
