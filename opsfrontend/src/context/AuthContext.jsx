import { createContext, useContext, useEffect, useState } from "react";
import { profileApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const[loading, setloading] = useState(true);

    useEffect(() =>{
        bootStrapAuth();
    }, []);

    const bootStrapAuth = async() =>{
        try{
            const res = await profileApi();
            setUser(res.data)
            setIsAuthenticated(true);
        } catch{
            setUser(null)
            setIsAuthenticated(false);
        } finally{
            setloading(false);
        }
    }


return(
    <AuthContext.Provider value={{user, isAuthenticated, loading}}>
        {children}
    </AuthContext.Provider>
)

}

export const useAuth = () => useContext(AuthContext);