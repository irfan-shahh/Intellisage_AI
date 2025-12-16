import React, { useState, useEffect, createContext,type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios, { type AxiosResponse } from "axios";

axios.defaults.withCredentials = true
const url='http://localhost:8000'

interface User {
    name: string,
    email: string,
    id:number,
    
}

interface DataContextType {
    user: User| null, 
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    checkAuth: () => Promise<void>,
    logout: () => Promise<void>,
}



interface DataProviderProps {
    children: ReactNode
}

export const DataContext = createContext<DataContextType| null>(null);


const DataProvider = ({ children }:DataProviderProps) => {
const [user, setUser] = useState<User | null>(null)
const [refresh, setRefresh] = useState<boolean>(false)
const navigate = useNavigate()

  
const checkAuth = async (): Promise<void> => {
    try {
        const response = await axios.get(`${url}/verify`);
        if (response.status === 200) {
            setUser(response.data.user);
        }
    } catch (error) {
        console.error('Error while verifying user:', error);
    }
};

const logout = async (): Promise<void> => {
    try {
        await axios.post(`${url}/logout`);
        setUser(null);
        navigate('/login', { replace: true });
        setRefresh(prev=>!prev);
    } catch (error) {
        console.error('Error while logging out:', error);
    }
};

useEffect(() => {
    checkAuth();
}, [refresh]);

    return (
        <DataContext.Provider value= {{ setUser, user, checkAuth, logout }}
>
    { children }
    </DataContext.Provider>
    )
}
export default DataProvider;