import { useContext, createContext, useState } from "react";

const HeaderVisibilityContext = createContext();

export function HeaderVisibilityProvider({ children }) {
    const [visible, setVisible] = useState(true);

    return (
        <HeaderVisibilityContext.Provider value={{ visible, setVisible }}>
            {children}
        </HeaderVisibilityContext.Provider>
    );
}

export const useHeaderVisibility = () => useContext(HeaderVisibilityContext);