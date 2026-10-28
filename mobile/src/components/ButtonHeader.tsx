import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { ArrowButton, IconButton } from "./ThemedButton";
import { NotificationsIcon } from "./icons";
import { Theme } from "@/constants/theme";

type ButtonType = 'arrow-left' | 'arrow-right' | 'notification';

interface ButtonHeaderProps {
    children ?: ReactNode,
    buttonOnLeft ?: boolean,
    onAction : () => void,
    buttonType : ButtonType,
    theme: Theme,
    style?: StyleProp<ViewStyle>;
};

function determineButton(button: ButtonType, action: ()=>void, theme: Theme) {
    switch (button) {
        case 'arrow-left':
            return <ArrowButton accessibilityLabel='left arrow' onPress={()=>action()} theme={theme} direction='back'/>
        case 'arrow-right':
            return <ArrowButton accessibilityLabel='right arrow' onPress={()=>action()} theme={theme} direction='forward'/>
        case 'notification':
            return (<IconButton
                accessibilityLabel="Notifications"
                icon={(color) => <NotificationsIcon size={26} color={color} />}
                onPress={()=>action()}
                theme={theme}
                size={64}
                />)
    
        default:
            break;
    }
}

export function ButtonHeader({children, buttonOnLeft=true, onAction, buttonType, theme, style}: ButtonHeaderProps) {
    return (
    <View style={[{flexDirection: "row", justifyContent:"space-between", alignItems:"center", marginBottom: 10}, style]}>
        {!buttonOnLeft && children}
        {determineButton(buttonType, onAction, theme)}
        {buttonOnLeft && children}
        
    </View>
    );
}