import React, { useState, useEffect } from 'react'
import {
  FileText,
  Users,
  BarChart3,
  Plus,
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  Calendar,
  Search,
  Bell,
  Filter,
  ArrowUpRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import api from '../Backend_api/SummaryApi';

const Link = ({ to, children, className, ...props }) => (
  <a href={to} className={className} {...props}>
    {children}
  </a>
)

// Static data
const staticStats = {
  totalQuotations: 156,
  pendingQuotations: 12,
  monthlyRevenue: 2450000,
  activeClients: 48,
  revenueGrowth: 15.7
};

export const Home = () => {
  // State for dynamic data (now using static data)
  const [stats, setStats] = useState(staticStats);
  const [recentQuotations, setRecentQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to format currency in Indian format (lakh, crore)
  const formatIndianCurrency = (num) => {
    if (num >= 10000000) { // 1 crore
      return (num / 10000000).toFixed(2).replace(/\.00$/, '') + ' crore';
    } else if (num >= 100000) { // 1 lakh
      return (num / 100000).toFixed(2).replace(/\.00$/, '') + ' lakh';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2).replace(/\.00$/, '') + ' thousand';
    } else {
      return num.toString();
    }
  };

  // Function to calculate revenue growth
  const calculateRevenueGrowth = (currentRevenue, previousRevenue) => {
    if (previousRevenue === 0) return 0;
    return ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
  };

  // Simulate data loading (optional - for demo purposes)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const fetchQuotations = async () => {
    try {
      const response = await api.DisplayRecentQuotations();
      if (response.data.success) {
        const allQuotations = response.data.data;

        // 1. Recent 5
        setRecentQuotations(allQuotations.slice(0, 5));

        // 2. Total Quotations
        const total = allQuotations.length;

        // 3. Monthly Revenue (Current Month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthRevenue = Math.round(
          allQuotations
            .filter((q) => {
              const date = new Date(q.quotationDate);
              return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, q) => sum + (q.amount || 0), 0)
        );

        // 4. Previous Month Revenue for growth calculation
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const previousMonthRevenue = Math.round(
          allQuotations
            .filter((q) => {
              const date = new Date(q.quotationDate);
              return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
            })
            .reduce((sum, q) => sum + (q.amount || 0), 0)
        );

        // 5. Calculate revenue growth
        const revenueGrowth = calculateRevenueGrowth(currentMonthRevenue, previousMonthRevenue);

        // 6. Pending Quotations
        const pendingCount = allQuotations.filter(q => q.status === 'Pending').length;

        // 7. Set stats 
        setStats((prev) => ({
          ...prev,
          totalQuotations: total,
          monthlyRevenue: currentMonthRevenue,
          pendingQuotations: pendingCount,
          revenueGrowth: parseFloat(revenueGrowth)
        }));
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  useEffect(() => { fetchQuotations() }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Final': return 'bg-green-100 text-green-800 border-green-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Sent': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Under-review': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Connection Error</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Unable to connect to the server. Make sure your backend API is running on http://localhost:5000
          </p>
          <div className="space-y-3">
            <button
              onClick={fetchData}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Saumi Consultancy </h1>
            <p className="text-sm text-gray-600">Quotation Management System</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-blue-600 transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/dashboard/createform"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Quotation</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Overview */}
         <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalQuotations}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Quotations</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : stats.pendingQuotations}
                </p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{loading ? '...' : formatIndianCurrency(stats.monthlyRevenue)}
                </p>
                <p className={`text-xs flex items-center mt-1 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : stats.activeClients}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3 new this month
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/dashboard/displayquotations"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">View All Quotations</h4>
                    <p className="text-sm text-gray-600">Manage and track all quotations</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/reports"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Reports & Analytics</h4>
                    <p className="text-sm text-gray-600">View business insights</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/clients"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Manage Clients</h4>
                    <p className="text-sm text-gray-600">Add and edit client information</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/templates"
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Templates</h4>
                    <p className="text-sm text-gray-600">Manage quotation templates</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quotations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentQuotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {quotation.clientName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {quotation.clientName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-500">
                        {quotation.quotationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        ₹{typeof quotation.amount === 'number' ? formatIndianCurrency(quotation.amount) : '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quotation.quotationDate ? new Date(quotation.quotationDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* About Section */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 py-10 px-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-800/90"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">About RK Technologies</h2>
            <p className="text-xl text-blue-100 leading-relaxed mb-12">
              We help businesses streamline their quotation and billing processes with cutting-edge technology.
              Our platform provides intuitive tools to create, manage, and track client transactions efficiently,
              helping you focus on growing your business.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <p className="text-4xl font-bold text-white mb-2">500+</p>
                <p className="text-blue-200 font-medium">Happy Clients</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <p className="text-4xl font-bold text-white mb-2">10K+</p>
                <p className="text-blue-200 font-medium">Quotations Generated</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <p className="text-4xl font-bold text-white mb-2">99.9%</p>
                <p className="text-blue-200 font-medium">Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 mb-2">&copy; 2025 RK Technologies. All rights reserved.</p>
          <p className="text-sm text-gray-500">
            Contact: info@rktechnologies.com | +91-XXXXXXXXXX
          </p>
        </div>
      </footer>
    </div>
  )
}