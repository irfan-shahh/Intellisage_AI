import { createContext, useEffect, useState } from "react";
import axios  from "axios";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const url='http://localhost:8000'



export const DataContext=createContext(null)
 axios.defaults.withCredentials=true


const DataProvider=({children})=>{
    const [name,setName]=useState('')
    const [user,setUser]=useState(null)
    const location=useLocation()
    const navigate=useNavigate()
    const [refresh,setRefresh]=useState(false)


    const checkAuth=async()=>{
        try{

           let response= await axios.get(`${url}/verify`)
           if(response.status===200){
            setName(response.data.user.name)
            setUser(response.data.user)
           }
    
}catch(error){
   console.log('error while verifying user',error)
}
    }

    const logout=async ()=>{
        try{ 
       await axios.post(`${url}/logout`)
       setName('')
       setUser(null)
       navigate('/login',{replace:true})
       setRefresh(true)
    
        }catch(error){
            console.log('error while logging out',error)
        }
    }
    useEffect(()=>{
        checkAuth()
    },[refresh])

    return(
      <DataContext.Provider value={{checkAuth,name,setName,logout,user,setUser}}>
        {children}
      </DataContext.Provider>
    )
}
export default DataProvider