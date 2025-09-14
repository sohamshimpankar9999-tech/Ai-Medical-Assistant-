import React, { useState } from 'react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const switchModeHandler = () => {
    setIsLoginMode(prevMode => !prevMode);
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have validation and an API call here.
    // For this demo, we'll just simulate a successful login.
    onLogin();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">
        {isLoginMode ? 'Welcome Back' : 'Create Account'}
      </h2>

      <form onSubmit={submitHandler} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
          <input type="email" name="email" id="email" required className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">Password</label>
          <input type="password" name="password" id="password" required minLength={6} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="••••••••" />
        </div>
        {!isLoginMode && (
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
            <input type="password" name="confirm-password" id="confirm-password" required minLength={6} className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="••••••••" />
          </div>
        )}
        <button type="submit" className="w-full px-6 py-3 text-sm font-semibold text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors">
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button type="button" className="flex items-center justify-center w-full px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700">
          {/* Google SVG */}
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
          Google
        </button>
        <button type="button" className="flex items-center justify-center w-full px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700">
          {/* Apple SVG */}
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12.01,2.02c-1.25-0.05-2.43,0.37-3.43,1.21c-1.12,0.93-2.1,2.25-2.5,3.83c-0.21,0.81,0.22,1.6,0.96,2.01 c0.74,0.4,1.66,0.24,2.21-0.45c0.6-0.75,0.73-1.68,0.59-2.58c0.14-0.03,0.28-0.05,0.42-0.05c0.9,0,1.75,0.36,2.4,0.99 c-0.04,1.49-0.84,2.83-2.06,3.67c-1.35,0.94-3.03,1.3-4.6,0.96c-1.7-0.37-3.13-1.55-4-3.17c-1.31-2.45-1.22-5.45,0.28-7.79 c1.5-2.34,3.94-3.8,6.6-3.86C11.01,0.11,11.5,0.13,12.01,2.02z M12.87,11.32c0.82-0.63,1.4-1.48,1.66-2.48 c-0.53,0.01-1.06,0.01-1.59,0.01c-1.12,0-2.25-0.21-3.33-0.56c-1.37,2.2-0.78,5.13,1.29,6.58c0.98,0.69,2.2,0.92,3.37,0.67 C13.41,14.65,12.98,12.95,12.87,11.32z"></path></svg>
          Apple
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        {isLoginMode ? "Don't have an account?" : "Already have an account?"}
        <button onClick={switchModeHandler} className="font-semibold text-teal-600 hover:underline ml-1">
          {isLoginMode ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
