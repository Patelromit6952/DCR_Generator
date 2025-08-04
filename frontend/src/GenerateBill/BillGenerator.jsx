import React, { useState, useRef } from 'react';
import { FaPlus, FaTrash, FaPrint, FaUser, FaShoppingCart } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import toast from 'react-hot-toast';

const BillGenerator = () => {
  const printRef = useRef();
  const [step, setStep] = useState(1); // 1: Client Details, 2: Add Products, 3: Generate Bill

  // Client Details State
  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gst: ''
  });

  // Product State
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    quantity: 1,
    rate: 0,
    taxPercent: 18
  });

  // Bill Details
  const [billNumber, setBillNumber] = useState(`BILL-${Date.now()}`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return false; // Phone is required
    const phoneRegex = /^[0-9]\d{9}$/; // Indian mobile number format
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  // Handle client details input
  const handleClientChange = (e) => {
    setClientDetails({
      ...clientDetails,
      [e.target.name]: e.target.value
    });
  };

  // Handle product input
  const handleProductChange = (e) => {
    setCurrentProduct({
      ...currentProduct,
      [e.target.name]: e.target.value
    });
  };

  // Add product to list
  const addProduct = () => {
    if (!currentProduct.name || !currentProduct.rate) {
      toast.error('Please fill product name and rate');
      return;
    }

    const product = {
      ...currentProduct,
      id: Date.now(),
      amount: parseFloat(currentProduct.quantity) * parseFloat(currentProduct.rate),
      taxAmount: (parseFloat(currentProduct.quantity) * parseFloat(currentProduct.rate) * parseFloat(currentProduct.taxPercent)) / 100
    };

    setProducts([...products, product]);
    setCurrentProduct({
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      taxPercent: 18
    });
    toast.success('Product added successfully');
  };

  // Remove product
  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
    toast.success('Product removed');
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = products.reduce((sum, product) => sum + product.amount, 0);
    const totalTax = products.reduce((sum, product) => sum + product.taxAmount, 0);
    const total = subtotal + totalTax;
    return { subtotal, totalTax, total };
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Proceed to next step
  const nextStep = () => {
    if (step === 1) {
      if (!clientDetails.name.trim()) {
        toast.error('Please enter client name');
        return;
      }
      if (!validatePhone(clientDetails.phone)) {
        toast.error('Please enter a valid 10-digit mobile number');
        return;
      }
      if (clientDetails.email && !validateEmail(clientDetails.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }
    if (step === 2) {
      if (products.length === 0) {
        toast.error('Please add at least one product');
        return;
      }
    }
    setStep(step + 1);
  };

  // Go back to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const { subtotal, totalTax, total } = calculateTotals();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
            <FaUser size={16} />
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
            <FaShoppingCart size={16} />
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
            <FaPrint size={16} />
          </div>
        </div>
      </div>

      {/* Step 1: Client Details */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={clientDetails.name}
                onChange={handleClientChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={clientDetails.phone}
                onChange={handleClientChange}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  clientDetails.phone && !validatePhone(clientDetails.phone) 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
              />
              {clientDetails.phone && !validatePhone(clientDetails.phone) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid 10-digit mobile number</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={clientDetails.email}
                onChange={handleClientChange}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  clientDetails.email && !validateEmail(clientDetails.email) 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {clientDetails.email && !validateEmail(clientDetails.email) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
              <input
                type="text"
                name="gst"
                value={clientDetails.gst}
                onChange={handleClientChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter GST number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={clientDetails.address}
                onChange={handleClientChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client address"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-start gap-2 mt-6 lg:justify-end">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r text-blue-900 from-gray-200 to-gray-200  font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lghover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            >
              Next: Add Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Products */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Add Product Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={currentProduct.name}
                  onChange={handleProductChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={currentProduct.quantity}
                  onChange={handleProductChange}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹)</label>
                <input
                  type="number"
                  name="rate"
                  value={currentProduct.rate}
                  onChange={handleProductChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
                <input
                  type="number"
                  name="taxPercent"
                  value={currentProduct.taxPercent}
                  onChange={handleProductChange}
                  min="0"
                  max="100"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={currentProduct.description}
                  onChange={handleProductChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={addProduct}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <FaPlus className="mr-2" /> Add Product
              </button>
            </div>
          </div>

          {/* Products List */}
          {products.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Added Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">Product</th>
                      <th className="border border-gray-300 p-3 text-left">Description</th>
                      <th className="border border-gray-300 p-3 text-center">Qty</th>
                      <th className="border border-gray-300 p-3 text-right">Rate</th>
                      <th className="border border-gray-300 p-3 text-right">Amount</th>
                      <th className="border border-gray-300 p-3 text-right">Tax</th>
                      <th className="border border-gray-300 p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="border border-gray-300 p-3">{product.name}</td>
                        <td className="border border-gray-300 p-3">{product.description}</td>
                        <td className="border border-gray-300 p-3 text-center">{product.quantity}</td>
                        <td className="border border-gray-300 p-3 text-right">₹{product.rate}</td>
                        <td className="border border-gray-300 p-3 text-right">₹{product.amount.toFixed(2)}</td>
                        <td className="border border-gray-300 p-3 text-right">₹{product.taxAmount.toFixed(2)}</td>
                        <td className="border border-gray-300 p-3 text-center">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                            title="Remove Product"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-200 text-blue-900 font-semibold rounded-lg shadow-lghover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Client Details
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg  hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                >
                  Generate Bill
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Generated Bill */}
      {step === 3 && (
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 print:shadow-none" ref={printRef}>
            {/* Bill Header */}
            <div className="border-b-2 border-gray-300 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-blue-600">Saumi Consultancy</h1>
                  <p className="text-gray-600 mt-2">Professional Services</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                  <p className="text-gray-600">Bill No: {billNumber}</p>
                  <p className="text-gray-600">Date: {new Date(billDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-medium">Name : {clientDetails.name}</p>
                  {clientDetails.email && <p>Email : {clientDetails.email}</p>}
                  <p>Phone : {clientDetails.phone}</p>
                  {clientDetails.address && <p>{clientDetails.address}</p>}
                  {clientDetails.gst && <p>GST: {clientDetails.gst}</p>}
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Item</th>
                    <th className="border border-gray-300 p-3 text-left">Description</th>
                    <th className="border border-gray-300 p-3 text-center">Qty</th>
                    <th className="border border-gray-300 p-3 text-right">Rate</th>
                    <th className="border border-gray-300 p-3 text-right">Amount</th>
                    <th className="border border-gray-300 p-3 text-right">Tax</th>
                    <th className="border border-gray-300 p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="border border-gray-300 p-3">{product.name}</td>
                      <td className="border border-gray-300 p-3">{product.description}</td>
                      <td className="border border-gray-300 p-3 text-center">{product.quantity}</td>
                      <td className="border border-gray-300 p-3 text-right">₹{product.rate}</td>
                      <td className="border border-gray-300 p-3 text-right">₹{product.amount.toFixed(2)}</td>
                      <td className="border border-gray-300 p-3 text-right">₹{product.taxAmount.toFixed(2)}</td>
                      <td className="border border-gray-300 p-3 text-right">₹{(product.amount + product.taxAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Total Tax:</span>
                  <span>₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b-2 border-gray-400 font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 pt-4 text-center text-gray-600">
              <p>Thank you Visit Again!</p>
              <p className="text-sm mt-2">This is a computer generated invoice.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className=" flex flex-wrap justify-end gap-4 print:hidden">
            <button
              onClick={prevStep}
              className=" w-full px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-200 text-blue-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </button>
            <div className="flex space-x-4">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <FaPrint className="mr-2" /> Print Bill
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setClientDetails({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    gst: ''
                  });
                  setProducts([]);
                  setBillNumber(`BILL-${Date.now()}`);
                  setBillDate(new Date().toISOString().split('T')[0]);
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-600 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Bill
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BillGenerator;