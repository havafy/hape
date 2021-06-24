import { createContext, useContext, ReactNode, useState } from "react";
import axios from 'axios'
type authContextType = {
    user: boolean;
    userName: string;
    login: () => void;
    logout: () => void;
};

const authContextDefaultValues: authContextType = {
    user: null,
    userName: 'loading',
    login: () => {},
    logout: () => {},
};

const AuthContext = createContext<authContextType>(authContextDefaultValues);

export function useAuth() {
    return useContext(AuthContext);
}

type Props = {
    children: ReactNode;
};

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<boolean>(null);
    const [userName, setUserName] = useState<string>('');
    const login = async () => {
        const { data } = await axios.get('healthcheck')
        console.log(data)
        setUserName(data.status)
        setUser(true);
    };

    const logout = () => {
        setUser(false);
    };

    const value = {
        user,
        userName,
        login,
        logout,
    };

    return (
        <>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    );
}
