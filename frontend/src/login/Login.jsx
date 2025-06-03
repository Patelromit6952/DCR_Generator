import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../Backend_api/SummaryApi'
import invoiceImage from '../assets/invoice.jpg'; // make sure the image path is correct

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  

  const handleLogin = async(e) => {
    e.preventDefault();
    try {
      const response = await api.login({email,password})
      const data = response.data
      console.log(data);
      if(data.success){
        localStorage.setItem('uId',data.data._id)
        localStorage.setItem('email',data.data.email)
        toast.success(data.message)
        navigate('/dashboard')
      }
      
    } catch (error) {
       toast.error('Login Failed');
    }
  };

  return (
    <div className="h-screen w-full bg-[#1e1e2f] flex justify-center items-center">
      <div className="flex w-[70%] h-[550px] bg-gray-100 rounded-lg shadow-lg overflow-hidden">
        <div
          className="flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${invoiceImage})` }}
        ></div>
        <div className="flex-1 flex justify-center items-center p-8 bg-white">
          <form onSubmit={handleLogin} className="w-full max-w-[350px] flex flex-col">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              Login to Your Account
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-3 mb-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 mb-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-blue-600 text-white rounded-md text-base hover:bg-blue-700 transition-colors mb-3"
            >
              Login
            </button>
            {/* <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
