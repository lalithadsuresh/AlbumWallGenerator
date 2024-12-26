import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoggedIn, setIsLoggedIn] = useState(!!token);

    // Update login state when token changes
    useEffect(() => {
        setIsLoggedIn(!!token);
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
