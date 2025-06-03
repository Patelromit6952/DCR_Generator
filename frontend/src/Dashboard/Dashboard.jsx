import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import profile from '../assets/profile.jpg';
import { IoMdHome } from "react-icons/io";
import { FaFileInvoice } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { MdLogout } from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear()
    toast.success("Logout Successfully")
    navigate('/login')
  };

  return (
    <div className="w-full h-screen flex overflow-hidden">
      <div className="w-1/5 h-full bg-gray-800 flex flex-col overflow-y-auto">
        <div className="text-white h-[18%] text-lg text-center p-5 border-b-4 border-white flex items-center">
          <img src={profile} alt="profile" className="h-24 w-24 rounded-full" />
          <p className="ml-5 font-bold text-lg">Saumi Consultancy</p>

        </div>
        <div className="flex flex-col gap-5 mt-6">
          <Link to='/dashboard/home' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <IoMdHome size={22} className="mr-2" /> Home
          </Link>
          <Link to='/dashboard/SedB' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <FaShoppingBag size={22} className="mr-2" /> SedB
          </Link>
          <Link to='/dashboard/sellsinvoice' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <FaFileInvoiceDollar size={22} className="mr-2" /> Sales Bill
          </Link>
          <Link to='/dashboard/invoices' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <FaFileInvoice size={22} className="mr-2" /> Invoices
          </Link>
          <Link to='/dashboard/setting' className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <IoIosSettings size={25} className="mr-2" /> Settings
          </Link>
          <button onClick={logout} className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition text-left">
            <MdLogout size={25} className="mr-2" /> Logout
          </button>
        </div>
      </div>

      <div className="w-4/5 bg-gray-200 p-5 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
