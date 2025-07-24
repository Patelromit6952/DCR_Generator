import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { IoMdHome } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import toast from 'react-hot-toast';
import { LiaFileInvoiceSolid } from "react-icons/lia";


const Dashboard = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Electronics', icon: <FaShoppingBag size={22} className="mr-2" /> },  
  ]

  const logout = () => {
    localStorage.clear()
    toast.success("Logout Successfull")
    navigate('/login')
  };

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/5 h-full bg-gray-800 flex flex-col overflow-y-auto flex-shrink-0">
        <div className="text-white h-[18%] text-lg text-center p-5 border-b-4 border-white flex items-center">
          <img src={logo} alt="profile" className="h-24 w-24 rounded-full" />
          <p className="ml-5 font-bold text-lg">Saumi Consultancy</p>
        </div>
        <div className="flex flex-col gap-5 mt-6">
          <Link to='/dashboard/home' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <IoMdHome size={22} className="mr-2" /> Home
          </Link>
          <Link to='/dashboard/createform' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <FaPlus size={22} className="mr-2" /> Create New Quotation
          </Link>
            <Link to='/dashboard/displayquotations' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <LiaFileInvoiceSolid size={22} className="mr-2" /> All-Quotations
          </Link>
          <Link to='/dashboard/sedB' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <FaFileInvoiceDollar size={22} className="mr-2" /> Generate Bill
          </Link>
          <button onClick={logout} className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition text-left">
            <MdLogout size={25} className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;