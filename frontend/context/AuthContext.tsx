import { createContext, useContext, ReactNode, useState } from "react";
type userInterface = { name: string, email: string}
type authContextType = {
    accessToken: string;
    user: userInterface;
    setUser: (user: userInterface) => void;
    login: (accessToken: string) => void;
    logout: () => void;
};

const authContextDefaultValues: authContextType = {
    accessToken: '',
    user: { name: '', email: ''},
    setUser: () => {},
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
const isServer = typeof window !== 'object'
let initialAccessToken = '';
if(!isServer){
    const accessToken = localStorage.getItem('accessToken')
    initialAccessToken = accessToken ?  accessToken : ''
}

export function AuthProvider({ children }: Props) {
    const [accessToken, setAccessToken] = useState<string>(initialAccessToken);
    const [user, setUser] = useState<userInterface>({name: '', email: ''});
    const login = (accessToken: string) => {
        setAccessToken(accessToken);
    };

    const logout = () => {
        setAccessToken('');
    };

    const value: authContextType = {
        accessToken,
        user,
        setUser,
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
