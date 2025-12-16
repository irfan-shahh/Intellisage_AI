import { ChangeEvent, useState } from "react"
import { userRegistration,userLogin} from "../services/api"
import { useNavigate } from "react-router-dom"

import { useDataContext } from "../context/useDataContext"

const registerInitialValues={
  name:'',
  email:'',
  password:'',
}
const loginInitialValues={
  email:'',
  password:'',
}

const Login:React.FC = () => {
  const [account ,setAccount]=useState('login')
  const[registerInfo,setRegisterInfo]=useState(registerInitialValues)
  const[loginInfo,setLoginInfo]=useState(loginInitialValues)
  const [loading,setLoading]=useState<boolean>(false)
  const [rloading,setrLoading]=useState<boolean>(false)
    const navigate=useNavigate()
    const {setUser}=useDataContext()

    const toggleAccount=()=>{
       setAccount(prev=>prev==='login' ? 'register':'login')
    }

    const onValueChange=(e:ChangeEvent<HTMLInputElement>)=>{
        setRegisterInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const onInputChange=(e:ChangeEvent<HTMLInputElement>)=>{
        setLoginInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const register= async()=>{

      try {
        setrLoading(true)
        let response= await userRegistration(registerInfo)
       if(response && response.status===200){
        setLoginInfo(registerInitialValues)
        toggleAccount()
       } 
      } catch (error) {
         console.log('error register',error)
      }finally{
        setrLoading(false)
      }
       
    }
    const login= async()=>{

      try {
        setLoading(true)
        let response= await userLogin(loginInfo)
        if(!response)return
        if( response && response.status===200){
          setUser(response.data.user)
          navigate('/')
        }
        
      } catch (error) {
        console.log('error login',error)
      }finally{
        setLoading(false)
      }

    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border p-8">

        <h1 className="text-2xl font-semibold text-center mb-2">Intellisage AI</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Summarize PDFs & Chat with AI
        </p>

        {
          account==='login' ? (
            <div>
              <h3 className="text-center font-medium text-lg mb-6">Login</h3>

              <input
                placeholder="Email"
                className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none"
                onChange={(e)=>onInputChange(e)}
                name="email"
                value={loginInfo.email}
              />

              <input
                placeholder="Password"
                type="password"
                className="w-full px-4 py-3 mb-6 border rounded-md focus:outline-none"
                onChange={(e)=>onInputChange(e)}
                name="password"
                value={loginInfo.password}
              />

              <button
                className="w-full bg-black text-white py-3 rounded-md font-medium"
                onClick={login}
              >
               {loading ?"Logging in ":"Login"}
              </button>

              <p className="text-center mt-5 text-gray-500 text-sm">OR</p>

              <button
                className="w-full mt-3 text-sm text-black underline"
                onClick={toggleAccount}
              >
                New User? Register
              </button>
            </div>
          ):(
            <div>
              <h3 className="text-center font-medium text-lg mb-6">Register</h3>

              <input
                placeholder="Name"
                className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none"
                onChange={(e)=>onValueChange(e)}
                name="name"
                value={registerInfo.name}
              />

              <input
                placeholder="Email"
                className="w-full px-4 py-3 mb-4 border rounded-md focus:outline-none"
                onChange={(e)=>onValueChange(e)}
                name='email'
                value={registerInfo.email}
              />

              <input
                placeholder="Password"
                type="password"
                className="w-full px-4 py-3 mb-6 border rounded-md focus:outline-none"
                onChange={(e)=>onValueChange(e)}
                name="password"
                value={registerInfo.password}
              />

              <button
                className="w-full bg-black text-white py-3 rounded-md font-medium"
                onClick={register}
              >
               {rloading?"Registering":"Register"}
              </button>

              <p className="text-center mt-5 text-gray-500 text-sm">OR</p>

              <button
                className="w-full mt-3 text-sm text-black underline"
                onClick={toggleAccount}
              >
                Already have an account?
              </button>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Login
