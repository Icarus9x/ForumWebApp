import { useState, useEffect } from 'react'
import AuthnContext from './AuthnContext'
import ProtectedRoute from './ProtectedRoute'
import Wrapper from './components/Wrapper.jsx'
import LoginForm from './components/LoginForm.jsx'
import {Route, Routes, useNavigate} from 'react-router'
import SuperUserContext from './SuperUserContext.jsx'

function App() {

  
  const [user, setUser] = useState(0)
  const navigate = useNavigate();
  const [superUser, setSuperUser] = useState(false);
  useEffect(() => {
    const checkAuthn = async () => {
      try {
        const response = await fetch('http://localhost:3001/session', {
          credentials: 'include',
        });
        if (response.ok) {
          const user = await response.json();
          setUser(user);
        }else
          setUser(0);
      } catch (err) {
        console.error("Session check failed", err);
      }

      
    }
    checkAuthn();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  
        body: JSON.stringify(credentials),
      });
  
      if (response.ok) {
        const user = await response.json();
        setUser(user);
        navigate('/');
        return {success: true};
  
      } else {
        return {success : false};
      }
    } catch (err) {
      console.error('Error: ' + err);
    }
  }

  const logout = async () =>{
    try{
      const res = await fetch('http://localhost:3001/logout', {
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if(res.ok){
        setUser(undefined);
        setSuperUser(false);
        navigate('/');
      }
    }catch(err){
      console.error('Error:' + err);
    }
  }

  const mfa = async (totp) => {
    try{
      const response = await fetch('http://localhost:3001/login-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  
        body: JSON.stringify(totp)
      });
  
      if (response.ok) {
        const user = await response.json();
        setSuperUser(true);
        navigate('/');
      }
    }catch(err){
      console.error("Error: " + err);
    }
  }

  return (
    <SuperUserContext.Provider value={superUser}>
    <AuthnContext.Provider value={user}>
      <Wrapper handleLogin={handleLogin} logout={logout} mfa = {mfa}/>
    </AuthnContext.Provider>
    </SuperUserContext.Provider>
    
  );
}

export default App