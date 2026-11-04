import { Theme, ThemeName, themes } from "@/constants/theme";
import { useStorageState } from "@/hooks/useStorageState";
import { createContext, PropsWithChildren, use } from "react";

const ThemeContext = createContext<{ 
                theme: Theme, 
                themeName: ThemeName, 
                setThemeName: (n: ThemeName) => void,
                isLoading: boolean } | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
    const [[isLoading, saved], setSaved] = useStorageState('theme');
    const themeName = (saved as ThemeName | null) ?? 'retro';  

    return (
        <ThemeContext.Provider
            value={{
                theme: themes[themeName],
                themeName,
                setThemeName: setSaved,
                isLoading: isLoading
            }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const value = use(ThemeContext);
    if (!value) {
    throw new Error('useTheme must be wrapped in a <ThemeProvider />');
    }

    return value;
}
