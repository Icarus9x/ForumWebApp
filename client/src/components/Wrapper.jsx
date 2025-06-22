import Home from './Home';
import {useState} from 'react';
import ProtectedRoute from '../ProtectedRoute'
import LoginForm from './LoginForm.jsx'
import {Route, Routes, useNavigate} from 'react-router'
import PostDisplay from './PostDisplay.jsx';
import AdminLogin from './AdminLogin';
import PostAdder from './PostAdder';
import PostEditor from './PostEditor.jsx';

function Wrapper(props){
    
    const {handleLogin, logout, mfa} = props
    const [posts, setPosts] = useState([]);
    


    return <Routes>
        <Route path='/' element = {<Home posts={posts} setPosts={setPosts} logout = {logout}/>}/>
        <Route path= '/login' element = {<LoginForm handleLogin = {handleLogin}/>}/>
        <Route path='/loginTOTP' element = {<AdminLogin mfa = {mfa}/>}/>
        <Route path='/posts/:id' element = {<ProtectedRoute><PostDisplay/></ProtectedRoute>}/>
        <Route path='/addPost' element = {<ProtectedRoute><PostAdder/></ProtectedRoute>}/>
        <Route path='/editPost/:id' element = {<ProtectedRoute><PostEditor/></ProtectedRoute>}/>
        </Routes>;
        
    
}

export default Wrapper;