/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext();
export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [authToken, setAuthToken] = useState(null);

	useEffect(() => {
		window.__authToken__ = authToken;
	}, [authToken]);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            setUser(data.user);
            setAuthToken(data.token);
            localStorage.setItem('authToken', data.token);
        } catch (err) {
            setError(err.message);
            setAuthToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    const logout = () => {
        setUser(null);
        setAuthToken(null);
       window.__authToken__ = null;
        localStorage.removeItem('authToken');
    }

    const isAuthenticated = () => {
        return !!authToken && !!user;
    }

    const hasRole = (role) => {
        return user && user.roles && user.roles.includes(role);
    }
    const hasPermission = (permission) => {
        return user && user.permissions && user.permissions.includes(permission);
    }

    const value = {
        user,
        loading,
        error,
        authToken,
        login,
        logout,
        isAuthenticated,
        hasRole,
        hasPermission
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
    
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function withAuth(Component,requredRole = null) {
    return function AuthenticatedComponent(props) {
        const {isAuthenticated,hasRole,user} = useAuth();

        if(!isAuthenticated()) {
            return <div>Please login to access this page.</div>;
        }
        if(requredRole && !hasRole(requredRole)) {
            return <div>You do not have permission to access this page.</div>;
        }

        return <Component {...props} />;
    };
}

export default useAuth;