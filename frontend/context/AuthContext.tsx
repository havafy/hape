import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import axios from "axios"
type userInterface = { username: string, email: string}
const guestUser = { username: '', email: ''}
type authContextType = {
    accessToken: string;
    user: any;
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

}

export function AuthProvider({ children }: Props) {
    const [accessToken, setAccessToken] = useState<string>(initialAccessToken);
    const [user, setUser] = useState<userInterface>(initialUser);
    const getUserProfile = async ()=>{
        if(!isServer && initialAccessToken !== ''){
            try {
                //send register data to API
                const { data } = await axios.get('users/profile', {
                    headers: {
                      'Authorization': `Bearer ${initialAccessToken}` 
                    }
                  })

               if(data?.user){
                   setUser(data.user)
               }
            } catch (err){
                console.log('err:' , err)
            }
        

        }
    }
    useEffect(()=> {
        getUserProfile()
    },[])

    const login = (accessToken: string, user: userInterface) => {
        localStorage.setItem('accessToken', accessToken)
        setAccessToken(accessToken)
        setUser(user)
    };

    const logout = () => {
        localStorage.setItem('accessToken', '')
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
