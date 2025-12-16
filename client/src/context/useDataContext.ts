import { useContext } from "react";
import { DataContext } from "./DataProvider";

export const useDataContext=()=>{
    const context=useContext(DataContext)
    if(!context){
        throw new Error('context is not availible')
    }
    return context;

}