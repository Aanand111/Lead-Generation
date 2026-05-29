import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isPremium, setIsPremium] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                return Boolean(JSON.parse(storedUser).isPremium);
            } catch (e) {
                return false;
            }
        }
        return false;
    });

    useEffect(() => {
        const checkPremium = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setIsPremium(Boolean(JSON.parse(storedUser).isPremium));
                } catch (e) {
                    setIsPremium(false);
                }
            } else {
                setIsPremium(false);
            }
        };

        // Listen for profile updates (fired in layouts/CustomerLayout.jsx)
        window.addEventListener('userProfileUpdated', checkPremium);
        // Also listen to storage events for cross-tab or direct local storage changes
        window.addEventListener('storage', checkPremium);

        // Run once on load
        checkPremium();

        return () => {
            window.removeEventListener('userProfileUpdated', checkPremium);
            window.removeEventListener('storage', checkPremium);
        };
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-premium', isPremium ? 'true' : 'false');
        localStorage.setItem('theme', theme);
        
        // Notify other tabs/components that may not be under this context
        window.dispatchEvent(new Event('storage'));
    }, [theme, isPremium]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isPremium }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
