import { useContext } from 'react';
import { Navigate } from 'react-router';
import AuthnContext from './AuthnContext.jsx';

function ProtectedRoute({ children }) {
  const user = useContext(AuthnContext);
  if(user===undefined)
    return <div>Loading...</div>
  return user === 0 ? <Navigate to="/login" replace /> : children;
}

export default ProtectedRoute;