import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleAuth: React.FC = () => {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/google/login/', {
        access_token: credentialResponse.credential,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error during Google authentication', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
};

export default GoogleAuth;

