// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('user_role') || null);
    const [loading, setLoading] = useState(true);

    // Run this on mount to check if tokens already exist
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, [token]);

    // Login Function
    const loginUser = async (username, password) => {
        try {
            // FIX: Pointing to the new TokenObtainPair endpoint
            const response = await axios.post('https://skillstream-backend-cxe5.onrender.com/api/auth/token/', {
                username,
                password
            });
            
            const accessToken = response.data.access;
            const actualRole = response.data.role; 
            
            setToken(accessToken);
            setUserRole(actualRole); 
            
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', response.data.refresh); // FIX: Store refresh token
            localStorage.setItem('user_role', actualRole); 
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
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
        localStorage.removeItem('refresh_token'); // FIX: Clear refresh token
        localStorage.removeItem('user_role');
        delete axios.defaults.headers.common['Authorization'];
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