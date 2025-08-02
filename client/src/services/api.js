import axios from "axios";
const url='http://localhost:8000'

axios.defaults.withCredentials=true

export const userRegistration=async (data)=>{
    try{

        let response=await axios.post(`${url}/register`,data)
        return response
    }catch(error){
        console.log('error while signup',error)
    }
}
export const userLogin=async (data)=>{
    try{

        let response=await axios.post(`${url}/login`,data)
        return response
    }catch(error){
        console.log('error while logging in',error)
    }
}

export const buySubscription= async (plan)=>{
  try{
        let response=await axios.post(`${url}/subscribe/?plan=${plan}`,{plan})
        return response
    }catch(error){
        console.log('error while buying subscription',error)
    }
}
export const activateFree=async ()=>{
    try{
        let response=await axios.post(`${url}/activate-free`)
        return response

    }catch(error){
        console.log('error while activating free plan',error)
    
}
}

