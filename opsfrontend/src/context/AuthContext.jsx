import { createContext, useContext, useEffect, useState } from "react";
import { profileApi, setHasSession } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        bootStrapAuth();
    }, []);

    const bootStrapAuth = async () => {
        try {
            const res = await profileApi();
            setUser(res.data);
            setIsAuthenticated(true);
            setHasSession(true); 
        } catch {
            setUser(null);
            setIsAuthenticated(false);
            setHasSession(false); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAuthenticated,
            setIsAuthenticated,
            loading,
            currentUserRole: user?.role ?? null,
            currentUserId: user?.id ?? null,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);