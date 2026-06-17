// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api from '../api'; // FIXED: Imported your new central API instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('user_role') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, [token]);

    // Login Function
    const loginUser = async (username, password) => {
        try {
            const response = await api.post('/api/auth/token/', {
                username,
                password
            });
            
            const accessToken = response.data.access;
            const actualRole = response.data.role; 
            
            setToken(accessToken);
            setUserRole(actualRole); 
            
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_role', actualRole); 
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.detail || "Invalid Credentials" };
        }
    };

    // Logout Function
    const logoutUser = () => {
        setToken(null);
        setUserRole(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
    };

    const contextData = {
        token,
        userRole,
        loginUser,
        logoutUser
    };

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;