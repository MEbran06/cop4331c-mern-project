import { Theme } from "@/constants/theme";
import { useTheme } from "@/contexts/theme";
import { ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";


export function PageContainer({children, fullBleed=false}: {children?: ReactNode, fullBleed?: boolean}) {
    const insets = useSafeAreaInsets();
    const {theme} = useTheme();
    const styles = useMemo(() => stylesGen(insets, theme), [insets, theme]);
    return (
        <View style={fullBleed ? { flex: 1 } : styles.container}>
            {children}
        </View>
    );
}

const stylesGen = (insets: EdgeInsets, theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop:insets.top, 
        paddingBottom:insets.bottom,
        backgroundColor: theme.paper
    }
});