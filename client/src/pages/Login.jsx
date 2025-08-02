import { useState } from "react"
import { userRegistration,userLogin} from "../services/api"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { DataContext } from "../context/DataProvider"
    const registerInitialValues={
        name:'',
        email:'',
        password:'',
    }
    const loginInitialValues={
        email:'',
        password:'',
    }
const Login = () => {
    const [account ,setAccount]=useState('login')
    const[registerInfo,setRegisterInfo]=useState(registerInitialValues)
    const[loginInfo,setLoginInfo]=useState(loginInitialValues)
    const navigate=useNavigate()
    const {setUser,setName}=useContext(DataContext)


    const toggleAccount=()=>{
       setAccount(prev=>prev==='login' ? 'register':'login')
    }

    const onValueChange=(e)=>{
        setRegisterInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const onInputChange=(e)=>{
        setLoginInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const register= async()=>{
       let response= await userRegistration(registerInfo)
       if(response && response.status===200){
        setLoginInfo(registerInitialValues)
        toggleAccount()
       } 
    }
    const login= async()=>{
          let response= await userLogin(loginInfo)
          if(!response)return
          if( response && response.status===200){
            setUser(response.data.user)
            setName(response.data.user.name)
            navigate('/')
          }
    }

  return (
    <div className="bg-blue-300 h-screen  ">
        <div className="pt-18 ">
        <h1 className="font-bold underline italic text-center mb-2 pt-4 ">Intellisage AI</h1>
        <h1 className="font-bold text-center "> Summarize PDFs, review resumes, and extract key insights from any text</h1>
        </div>
        {
          account==='login' ? (
            <div className="mt-10 flex justify-center">
        <div  className="mt-4 bg-slate-300 w-[500px] h-3/5 rounded-xl overflow-hidden ">
            <div className="flex flex-col  ">
                <h3 className="text-center font-semibold text-xl mt-2 mb-4">Login here</h3>
                <input placeholder="Enter email"  className="px-2 py-4 bg-slate-300 focus:outline-none
                 placeholder-gray-500 "
                onChange={(e)=>onInputChange(e)} name="email"
                value={loginInfo.email} ></input>
                <input placeholder="Enter password" type="password" className="px-2 py-4 bg-slate-300
                focus:outline-none placeholder-gray-500 "
                 onChange={(e)=>onInputChange(e)} name="password"
                 value={loginInfo.password}></input>
                <button className="w-full bg-gray-400 py-3 rounded-md mt-5 font-semibold" 
                onClick={login}>Login</button>
                <p  className="text-center mt-5 text-slate-600">OR</p>
                <button className="text-center m-4 font-medium"
                onClick={toggleAccount}> New User ? Click to Register</button>
            </div>
            </div>
        </div>


          ):(
            <div className="mt-10 flex justify-center">
        <div  className="mt-4 bg-slate-300 w-[500px] h-3/5 rounded-xl overflow-hidden ">
            <div className="flex flex-col  ">
                <h3 className="text-center font-semibold text-xl mt-2 mb-2">Register here</h3>
                <input placeholder="Enter Name"  className="px-2 py-4 bg-slate-300 focus:outline-none
                 placeholder-gray-500"
                 onChange={(e)=>onValueChange(e)} name="name"
                 value={registerInfo.name}></input>
                <input placeholder="Enter email"  className="px-2 py-4 bg-slate-300 focus:outline-none
                 placeholder-gray-500"
                  onChange={(e)=>onValueChange(e)} name='email'
                  value={registerInfo.email}></input>
                <input placeholder="Enter password" type="password" className="px-2 py-4 bg-slate-300
                focus:outline-none placeholder-gray-500 "
                 onChange={(e)=>onValueChange(e)}  name="password"
                 value={registerInfo.password}></input>
                <button className="w-full bg-gray-400 py-3 rounded-md mt-5 font-semibold" 
                onClick={register}>Register</button>
                <p  className="text-center mt-5 text-slate-600">OR</p>
                <button className="text-center m-4 font-medium"
                onClick={toggleAccount}> Already have an account ? Click here to login</button>
            </div>
            </div>
        </div>

          )
        }
        
    </div>
  )
}

export default Login