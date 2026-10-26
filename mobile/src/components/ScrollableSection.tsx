import { isIOS } from "@/app/preferences";
import { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView } from "react-native";


interface Props {
    children: ReactNode
}

export function ScrollableSection({children}: Props) {

    return (
        <KeyboardAvoidingView style={{flex: 1}} behavior={isIOS ? 'padding': undefined}>
            <ScrollView keyboardShouldPersistTaps='handled' alwaysBounceVertical={false} showsVerticalScrollIndicator={false}>
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}