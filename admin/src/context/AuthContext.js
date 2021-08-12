import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"

const guestUser = { username: '', email: ''}


const authContextDefaultValues = {
    accessToken: '',
    user: guestUser,
    action: { event: '', payload: {}},
    updateAction: (action) => {},
    login: () => {},
    logout: () => {},
};

const AuthContext = createContext(authContextDefaultValues);

export function useAuth() {
    return useContext(AuthContext);
}


const isServer = typeof window !== 'object'
let initialAccessToken = '';
let initialUser = guestUser
if(!isServer){
    const accessToken = localStorage.getItem('accessToken')
    initialAccessToken = accessToken ?  accessToken : ''

}

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(initialAccessToken);
    const [user, setUser] = useState(initialUser);
    const [action, setAction] = useState({ event: '', payload: {}});
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
    })
    const cleanToken = () => {

        localStorage.setItem('accessToken', '')
        window.location.reload()
    }
    const login = (accessToken, user) => {
        localStorage.setItem('accessToken', accessToken)
        setAccessToken(accessToken)
        setUser(user)
    };

    const logout = () => {
        localStorage.setItem('accessToken', '')
        setAccessToken('')
        setUser(guestUser)
    };

    const updateAction = (action) => {
        setAction(action)
    };
    const value = {
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
