import {encoding_for_model} from 'tiktoken'

const encoder=encoding_for_model('gpt-4o-mini')
export const countTokens=(text:string)=>{
      return encoder.encode(text).length;
}