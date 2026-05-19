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
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
                username,
                password
            });
            
            const accessToken = response.data.access;
            const actualRole = response.data.role; // <-- Grab the real database role from Django!
            
            setToken(accessToken);
            setUserRole(actualRole); // <-- Save it in state
            
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('user_role', actualRole); // <-- Save it in storage
            
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