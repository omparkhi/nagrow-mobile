import { useContext, createContext, useState, useRef, useEffect } from "react";
import { Animated } from "react-native";

const NavBarVisibilityContext = createContext();

export function NavBarVisibilityProvider({ children }) {
    const [visible, setVisible] = useState(true);

    // 1. Create an Animated Value (1 = Visible, 0 = Hidden)
    const visibilityAnim = useRef(new Animated.Value(1)).current;

    // 2. Animate whenever 'visible' changes
    useEffect(() => {
        Animated.timing(visibilityAnim, {
            toValue: visible ? 1 : 0,
            stiffness: 300,
            damping: 30,
            mass: 0.5,
            duration: 300, // Speed of the slide (300ms is standard smooth)
            useNativeDriver: true, // Optimizes performance
        }).start();
    }, [visible]);

    return (
        <NavBarVisibilityContext.Provider value={{ visible, setVisible, visibilityAnim }}>
            {children}
        </NavBarVisibilityContext.Provider>
    );
}

export const useBottomBarVisibility = () => useContext(NavBarVisibilityContext);
