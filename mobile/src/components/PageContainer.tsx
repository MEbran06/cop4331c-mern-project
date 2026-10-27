import { fonts } from "@/constants/theme";
import { ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";


export function PageContainer({children}: {children: ReactNode}) {
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => stylesGen(insets), [insets]);
    return (
        <View style={styles.container}>
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