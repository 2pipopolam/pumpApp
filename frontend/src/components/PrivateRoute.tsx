import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface Props {
  children: JSX.Element;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { accessToken } = useContext(AuthContext);

  return accessToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

