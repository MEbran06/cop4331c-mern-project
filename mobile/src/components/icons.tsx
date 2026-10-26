import { FontAwesomeFreeSolid } from "@react-native-vector-icons/fontawesome-free-solid";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// Password is hidden: eye with a slash. Tap to show the password.
export function EyeOffIcon({ size = 22, color = '#111111'}: IconProps) {
  return (
    <FontAwesomeFreeSolid name="eye-slash" size={size} color={color} />
  );
}

// Password is visible: plain eye.
export function EyeIcon({ size = 22, color = '#111111'}: IconProps) {
  return (
    <FontAwesomeFreeSolid name="eye" size={size} color={color} />
  );
}

// The arrow in the black block on the main button.
export function ArrowRightIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
  return (
    <FontAwesomeFreeSolid name="arrow-right" size={size} color={color} />
  );
}

// Back arrow (sign-up, verify and reset screens).
export function ArrowLeftIcon({ size = 22, color = '#111111'}: IconProps) {
  return (
    <FontAwesomeFreeSolid name="arrow-left" size={size} color={color} />
  );
}

export function NotificationsIcon({ size = 22, color = '#111111'}: IconProps) {
  return (
    <FontAwesomeFreeSolid name="bell" size={size} color={color} />
  );
}