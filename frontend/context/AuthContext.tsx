import { createContext, useContext, ReactNode, useState } from "react";
type userInterface = { username: string, email: string}
const guestUser = { username: '', email: ''}
type authContextType = {
    accessToken: string;
    user: userInterface;
    login: (accessToken: string, user: userInterface) => void;
    logout: () => void;
};

const authContextDefaultValues: authContextType = {
    accessToken: '',
    user: guestUser,
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
let initialUser = guestUser
if(!isServer){
    const accessToken = localStorage.getItem('accessToken')
    initialAccessToken = accessToken ?  accessToken : ''
    const user = localStorage.getItem('user')
    initialUser = user ?  JSON.parse(user): guestUser

}

export function AuthProvider({ children }: Props) {
    const [accessToken, setAccessToken] = useState<string>(initialAccessToken);
    const [user, setUser] = useState<userInterface>(initialUser);
    const login = (accessToken: string, user: userInterface) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('user', JSON.stringify(user))
        setAccessToken(accessToken)
        setUser(user)
    };

    const logout = () => {
        localStorage.setItem('accessToken', '')
        localStorage.setItem('user', JSON.stringify(guestUser))
        setAccessToken('')
        setUser(guestUser)
    };

    const value: authContextType = {
        accessToken,
        user,
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
