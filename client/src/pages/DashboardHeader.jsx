import { Link } from "react-router-dom"
import { useContext } from "react"
import { DataContext } from "../context/DataProvider"
import { useNavigate } from "react-router-dom"


const DashboardHeader = () => {
    const {name,logout}=useContext(DataContext)
    const navigate=useNavigate()
    const logoutUser=()=>{
      logout()
      navigate('/login',{replace:true})
    }
  return (
    <div>
   <div>
      <p className=" bg-slate-600 text-center text-white pt-2 underline font-semibold italic">Intellisage AI</p>
     <ul className="flex items-center justify-around bg-slate-600 h-16 pt-2 text-white ">
      <li className=""> <Link to='/summarize' >Summarize PDF</Link></li>
      <li> <Link to='/chat' >Start a chat</Link></li>
      <li> <Link to='/plans' >Plans</Link></li>
      <li> <Link to='/account' >Account</Link></li>
      <div className="flex items-center gap-x-8">

      <button className=" bg-slate-700 p-2 rounded-xl w-28"  onClick={logoutUser}>Logout</button>
      <p className="italic  font-semibold underline">{name}</p>
      </div>
     </ul>
   </div>
    </div>
  )
}

export default DashboardHeader