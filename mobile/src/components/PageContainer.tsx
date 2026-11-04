import { ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";


export function PageContainer({children, fullBleed=false}: {children?: ReactNode, fullBleed?: boolean}) {
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => stylesGen(insets), [insets]);
    return (
        <View style={fullBleed ? { flex: 1 } : styles.container}>
            {children}
        </View>
    );
}

const stylesGen = (insets: EdgeInsets) => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop:insets.top, 
        paddingBottom:insets.bottom
    }
});