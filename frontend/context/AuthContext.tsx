import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import axios from "axios"
type userInterface = { username: string, email: string}
const guestUser = { username: '', email: ''}
type authContextType = {
    accessToken: string;
    user: any;
    action: actionType;
    updateAction: (action: actionType) => void;
    login: (accessToken: string, user: userInterface) => void;
    logout: () => void;
};
type actionType = {
    event: string, 
    payload: any
}

const authContextDefaultValues: authContextType = {
    accessToken: '',
    user: guestUser,
    action: { event: '', payload: {}},
    updateAction: (action: actionType) => {},
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
    const [action, setAction] = useState<actionType>({ event: '', payload: {}});
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
        
               if(data?.carts){
                setAction({event: 'CART_SUMMARY_UPDATE', payload: data.carts})
               }
            } catch (err){
                cleanToken()
            }
        

        }
    }
    useEffect(()=> {
        getUserProfile()
    },[])
    const cleanToken = () => {

        localStorage.setItem('accessToken', '')
        window.location.reload()
    }
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

    const updateAction = (action: actionType) => {
        setAction(action)
    };
    const value: authContextType = {
        accessToken,
        user,
        login,
        logout,
        action,
        updateAction
    };

    return (
        <>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    );
}
