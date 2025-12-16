import {  useContext } from "react"
import { DataContext } from "../context/DataProvider"
import { Navigate } from "react-router-dom"

const PrivateRoute = ({children}) => {
    const {user}=useContext(DataContext)
    if(!user){
        return <Navigate to='/login' replace={true}/>
    }
    return children
}

export default PrivateRoute