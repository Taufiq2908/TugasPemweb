import React, { useState } from 'react';
import { LoginForm, RegisterForm } from '../components/Auth';

const AuthPage = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Selamat Datang di Makan Ki'
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Temukan kuliner terbaik di Indonesia
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isLoginMode ? (
          <LoginForm 
            onLogin={onLogin} 
            onSwitchMode={() => setIsLoginMode(false)} 
          />
        ) : (
          <RegisterForm 
            onLogin={onLogin} 
            onSwitchMode={() => setIsLoginMode(true)} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;