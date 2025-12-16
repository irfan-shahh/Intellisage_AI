
import './App.css';
import Login from './pages/Login';
import {Routes,Route, Navigate} from 'react-router-dom'
import { useContext } from 'react';
import { DataContext } from './context/DataProvider';
import Summarize from './components/Summarize';
import Chat from './components/Chat';
import Plans from './components/Plans';
import Layout from './components/Layout';
import PaymentSuccess from './components/payment/PaymentSuccess'
import PaymentCancel from './components/payment/PaymentCancel';
import Account from './components/Account';
function App() {
  const {user}=useContext(DataContext)


  return (
    <div>

      <Routes>
        
           <Route path='/login' element={!user ? <Login/>: <Navigate to='/' replace={true}/>}/>
           <Route path='/payment/success' element={<PaymentSuccess/>}/>
           <Route path='/payment/cancel' element={<PaymentCancel/>}/>
     
            {
              user && (
                <>
            <Route path='/' element ={<Layout/>}>
            <Route index element={<Plans />} /> 
            <Route path='/summarize' element={<Summarize/>}/>
            <Route path='/chat' element={<Chat/>}/>
            <Route path='/plans' element={<Plans/>}/>
            <Route path='/account' element={<Account/>}/>
            </Route>
            </>
               ) 
              }
              {
                !user && <Route path='*' element={<Navigate to='/login' replace={true}/>}/>
              }
      </Routes>
 

    </div>
  );
}

export default App;
