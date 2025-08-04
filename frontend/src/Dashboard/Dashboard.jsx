import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { IoMdHome } from "react-icons/io";
import { FaPlus, FaBars } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import toast from 'react-hot-toast';
import { LiaFileInvoiceSolid } from "react-icons/lia";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    toast.success("Logout Successful");
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden">

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-gray-800 p-4">
        <div className="flex items-center">
          <img src={logo} alt="profile" className="h-10 w-10 rounded-full" />
          <p className="ml-3 text-white font-bold text-lg">Saumi Consultancy</p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`bg-gray-800 md:w-1/5 w-full md:h-full ${sidebarOpen ? 'block' : 'hidden'} md:block z-40 fixed md:static top-0 left-0 h-full overflow-y-auto`}>
        <div className="text-white text-lg text-center p-5 border-b-4 border-white flex items-center">
          <img src={logo} alt="profile" className="h-16 w-16 rounded-full" />
          <p className="ml-4 font-bold hidden md:block">Saumi Consultancy</p>
        </div>
        <div className="flex flex-col gap-2 mt-6">
          <Link to='/dashboard/home' onClick={() => setSidebarOpen(false)} className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <IoMdHome size={22} className="mr-2" /> Home
          </Link>
          <Link to='/dashboard/createform' onClick={() => setSidebarOpen(false)} className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <FaPlus size={22} className="mr-2" /> Create New Quotation
          </Link>
          <Link to='/dashboard/displayquotations' onClick={() => setSidebarOpen(false)} className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <LiaFileInvoiceSolid size={22} className="mr-2" /> All-Quotations
          </Link>
          <Link to='/dashboard/bill' onClick={() => setSidebarOpen(false)} className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition">
            <FaFileInvoiceDollar size={22} className="mr-2" /> Generate Bill
          </Link>
          <button onClick={handleLogoutClick} className="text-white px-5 py-3 text-lg flex items-center hover:bg-blue-500 transition text-left">
            <MdLogout size={25} className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto mt-16 md:mt-0 p-4 md:p-6">
        <Outlet />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <MdLogout size={48} className="mx-auto text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? You will need to login again to access your dashboard.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-red-600 transition duration-200 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
