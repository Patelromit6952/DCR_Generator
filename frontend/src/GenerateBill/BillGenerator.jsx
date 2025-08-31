import React, { useState, useRef } from 'react';
import { FaPlus, FaTrash, FaPrint, FaUser, FaShoppingCart } from 'react-icons/fa';

const BillGenerator = () => {
  const printRef = useRef();
  const [step, setStep] = useState(1);

  // Company Details (Fixed)
  const companyDetails = {
    name: "SAUMI",
    subtitle: "CONSULTING ENGINEERS",
    address: "S.F-54, Bakrol Square, Bakrol, Anand",
    phone: "99781 89122",
    email: "saumi@civilmail.com",
    gstin: "24AAAAP0074012N"
  };

  // Client Details State
  const [clientDetails, setClientDetails] = useState({
    name: '',
    address: '',
    gstin: '',
    phone: '',
    email: ''
  });

  // Fixed Products from your standard invoice
  const fixedProducts = [
    { id: 'drawing-sheet', particulars: 'DRAWING SHEET', defaultRate: 7000.00 },
    { id: 'fire-load-report', particulars: 'FIRE LOAD REPORT', defaultRate: 2000.00 },
    { id: 'schedule-7', particulars: 'SCHEDULE 7', defaultRate: 2000.00 },
    { id: 'annexure-4-6', particulars: 'ANNEXURE 4 + 6', defaultRate: 2000.00 },
    { id: 'evacuation-map', particulars: 'EVACUATION MAP', defaultRate: 2000.00 }
  ];

  // Product State
  const [products, setProducts] = useState([]);
  const [selectedFixedProducts, setSelectedFixedProducts] = useState({});
  const [currentProduct, setCurrentProduct] = useState({
    particulars: '',
    netQty: 1,
    ratePerSheet: 0
  });
  const [showCustomProductForm, setShowCustomProductForm] = useState(false);

  // Bill Details
  const [billNumber, setBillNumber] = useState(`39/0/25-26`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);

  // Validation functions
  const validatePhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^[0-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateGSTIN = (gstin) => {
    if (!gstin) return true; // Optional field
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  // Handle client details input
  const handleClientChange = (e) => {
    setClientDetails({
      ...clientDetails,
      [e.target.name]: e.target.value
    });
  };

  // Handle fixed product selection
  const handleFixedProductChange = (productId, field, value) => {
    setSelectedFixedProducts({
      ...selectedFixedProducts,
      [productId]: {
        ...selectedFixedProducts[productId],
        [field]: value
      }
    });
  };

  // Handle custom product input
  const handleProductChange = (e) => {
    setCurrentProduct({
      ...currentProduct,
      [e.target.name]: e.target.value
    });
  };

  // Add selected fixed products to list
  const addSelectedFixedProducts = () => {
    const newProducts = [];
    Object.keys(selectedFixedProducts).forEach(productId => {
      const fixedProduct = fixedProducts.find(p => p.id === productId);
      const selectedData = selectedFixedProducts[productId];
      
      if (selectedData?.selected) {
        const product = {
          id: `fixed-${productId}-${Date.now()}`,
          particulars: fixedProduct.particulars,
          netQty: selectedData.netQty || 1,
          ratePerSheet: selectedData.ratePerSheet || fixedProduct.defaultRate,
          amount: (selectedData.netQty || 1) * (selectedData.ratePerSheet || fixedProduct.defaultRate)
        };
        newProducts.push(product);
      }
    });

    if (newProducts.length > 0) {
      setProducts([...products, ...newProducts]);
      setSelectedFixedProducts({});
      alert(`${newProducts.length} product(s) added successfully`);
    } else {
      alert('Please select at least one product');
    }
  };

  // Add custom product to list
  const addCustomProduct = () => {
    if (!currentProduct.particulars || !currentProduct.ratePerSheet) {
      alert('Please fill particulars and rate per sheet');
      return;
    }

    const product = {
      ...currentProduct,
      id: `custom-${Date.now()}`,
      amount: parseFloat(currentProduct.netQty) * parseFloat(currentProduct.ratePerSheet)
    };

    setProducts([...products, product]);
    setCurrentProduct({
      particulars: '',
      netQty: 1,
      ratePerSheet: 0
    });
    setShowCustomProductForm(false);
    alert('Custom product added successfully');
  };

  // Remove product
  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  // Calculate totals
  const calculateTotals = () => {
    const invoiceValue = products.reduce((sum, product) => sum + product.amount, 0);
    const cgst = invoiceValue * 0.09; // 9% CGST
    const sgst = invoiceValue * 0.09; // 9% SGST
    const totalInvoiceValue = invoiceValue + cgst + sgst;
    return { invoiceValue, cgst, sgst, totalInvoiceValue };
  };

  // Convert number to words (simplified version)
  const numberToWords = (num) => {
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    
    if (num === 0) return 'ZERO';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' HUNDRED' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' THOUSAND' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    
    return 'NUMBER TOO LARGE';
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Navigation functions
  const nextStep = () => {
    if (step === 1) {
      if (!clientDetails.name.trim()) {
        alert('Please enter client name');
        return;
      }
      if (!clientDetails.address.trim()) {
        alert('Please enter client address');
        return;
      }
    }
    if (step === 2) {
      if (products.length === 0) {
        alert('Please add at least one item');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const { invoiceValue, cgst, sgst, totalInvoiceValue } = calculateTotals();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-300'}`}>
            <FaUser size={16} />
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-300'}`}>
            <FaShoppingCart size={16} />
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-300'}`}>
            <FaPrint size={16} />
          </div>
        </div>
      </div>

      {/* Step 1: Client Details */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={clientDetails.name}
                onChange={handleClientChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
              <input
                type="text"
                name="gstin"
                value={clientDetails.gstin}
                onChange={handleClientChange}
                className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  clientDetails.gstin && !validateGSTIN(clientDetails.gstin) 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter GSTIN (15 characters)"
                maxLength="15"
              />
              {clientDetails.gstin && !validateGSTIN(clientDetails.gstin) && (
                <p className="text-red-500 text-sm mt-1">Invalid GSTIN format</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={clientDetails.address}
                onChange={handleClientChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={clientDetails.phone}
                onChange={handleClientChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={clientDetails.email}
                onChange={handleClientChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            >
              Next: Add Items
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
          {/* Fixed Products Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Standard Products</h2>
            <div className="space-y-4">
              {fixedProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id={product.id}
                      checked={selectedFixedProducts[product.id]?.selected || false}
                      onChange={(e) => handleFixedProductChange(product.id, 'selected', e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor={product.id} className="flex-1 text-lg font-medium text-gray-700">
                      {product.particulars}
                    </label>
                    
                    {selectedFixedProducts[product.id]?.selected && (
                      <div className="flex space-x-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={selectedFixedProducts[product.id]?.netQty || 1}
                            onChange={(e) => handleFixedProductChange(product.id, 'netQty', parseInt(e.target.value))}
                            className="w-16 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Rate (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={selectedFixedProducts[product.id]?.ratePerSheet || product.defaultRate}
                            onChange={(e) => handleFixedProductChange(product.id, 'ratePerSheet', parseFloat(e.target.value))}
                            className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent text-right"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="text-right">
                            <div className="text-xs text-gray-600 mb-1">Amount</div>
                            <div className="font-semibold text-gray-800">
                              ₹{((selectedFixedProducts[product.id]?.netQty || 1) * (selectedFixedProducts[product.id]?.ratePerSheet || product.defaultRate)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={addSelectedFixedProducts}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <FaPlus className="mr-2" /> Add Selected Products
              </button>
            </div>
          </div>

          {/* Custom Product Addition */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Custom Product</h3>
              <button
                onClick={() => setShowCustomProductForm(!showCustomProductForm)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center"
              >
                <FaPlus className="mr-2" /> 
                {showCustomProductForm ? 'Cancel' : 'Add Custom Product'}
              </button>
            </div>
            
            {showCustomProductForm && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Particulars</label>
                    <input
                      type="text"
                      name="particulars"
                      value={currentProduct.particulars}
                      onChange={handleProductChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter custom item description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Net Qty</label>
                    <input
                      type="number"
                      name="netQty"
                      value={currentProduct.netQty}
                      onChange={handleProductChange}
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate Per Sheet (₹)</label>
                    <input
                      type="number"
                      name="ratePerSheet"
                      value={currentProduct.ratePerSheet}
                      onChange={handleProductChange}
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={addCustomProduct}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Custom Item
                  </button>
                </div>
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Added Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">NO.</th>
                      <th className="border border-gray-300 p-3 text-left">PARTICULARS</th>
                      <th className="border border-gray-300 p-3 text-center">Net Qty</th>
                      <th className="border border-gray-300 p-3 text-right">Rate Per Sheet</th>
                      <th className="border border-gray-300 p-3 text-right">Amount</th>
                      <th className="border border-gray-300 p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={product.id}>
                        <td className="border border-gray-300 p-3">{index + 1}</td>
                        <td className="border border-gray-300 p-3">{product.particulars}</td>
                        <td className="border border-gray-300 p-3 text-center">{product.netQty}</td>
                        <td className="border border-gray-300 p-3 text-right">₹{product.ratePerSheet}</td>
                        <td className="border border-gray-300 p-3 text-right">₹{product.amount.toFixed(2)}</td>
                        <td className="border border-gray-300 p-3 text-center">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Client Details
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                >
                  Generate Tax Invoice
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Generated Tax Invoice */}
      {step === 3 && (
        <div>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6 print:shadow-none print:p-2 print:m-0 print:max-w-none" ref={printRef}>
            {/* Header with Logo and Company Info */}
            <div className="border-b-2 border-gray-800 pb-4 mb-5 print:pb-3 print:mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="text-orange-500 mr-4 print:mr-3">
                    {/* Building icon placeholder */}
                    <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center print:w-10 print:h-10">
                      <svg className="w-6 h-6 text-orange-500 print:w-5 print:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 2.5L18.5 12H17v6H7v-6H5.5L12 5.5z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 print:text-2xl">{companyDetails.name}</h1>
                    <p className="text-base text-gray-600 font-medium print:text-base">{companyDetails.subtitle}</p>
                    <div className="text-sm text-gray-600 mt-2 space-y-1 print:text-sm print:mt-2 print:space-y-1">
                      <p>{companyDetails.address}</p>
                      <p>📞 {companyDetails.phone}</p>
                      <p>✉️ {companyDetails.email}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 print:text-xl print:mb-2">TAX INVOICE</h2>
                  <div className="text-sm text-gray-700 print:text-sm">
                    <p><span className="font-semibold">DATE:</span> {new Date(billDate).toLocaleDateString('en-GB')}</p>
                    <p><span className="font-semibold">BILL NO:</span> {billNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client and Company Details Grid */}
            <div className="grid grid-cols-2 gap-8 mb-6 print:gap-6 print:mb-5">
              <div>
                <h3 className="font-bold text-gray-800 mb-3 text-base print:text-sm print:mb-2">COMPANY NAME: {clientDetails.name}</h3>
                <div className="text-sm text-gray-700 space-y-1 print:text-sm print:space-y-1">
                  <p><span className="font-semibold">ADDRESS:</span></p>
                  <p className="ml-3 print:ml-2">{clientDetails.address}</p>
                  {clientDetails.gstin && (
                    <p><span className="font-semibold">GSTIN:</span> {clientDetails.gstin}</p>
                  )}
                  {clientDetails.phone && (
                    <p><span className="font-semibold">PHONE:</span> {clientDetails.phone}</p>
                  )}
                  {clientDetails.email && (
                    <p><span className="font-semibold">EMAIL:</span> {clientDetails.email}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-gray-800 mb-3 text-base print:text-sm print:mb-2">NAME: {companyDetails.name} CONSULTING ENGINEERS</h3>
                <div className="text-sm text-gray-700 space-y-1 print:text-sm print:space-y-1">
                  <p><span className="font-semibold">BANK:</span> BANK OF BARODA</p>
                  <p><span className="font-semibold">IFSC CODE:</span> BARB0BAKROL</p>
                  <p><span className="font-semibold">AC/NO:</span> 4901020000229</p>
                  <p><span className="font-semibold">CIN:</span> 24AAAAP0074012N</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 print:mb-5">
              <table className="w-full border-collapse border border-gray-800 text-sm print:text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-800 p-3 text-left font-bold print:p-2">NO.</th>
                    <th className="border border-gray-800 p-3 text-left font-bold print:p-2">PARTICULARS</th>
                    <th className="border border-gray-800 p-3 text-center font-bold print:p-2">Net Qty</th>
                    <th className="border border-gray-800 p-3 text-center font-bold print:p-2">RATE<br/>PER SHEET<br/>Rs. P.</th>
                    <th className="border border-gray-800 p-3 text-right font-bold print:p-2">Amount<br/>Rs. P.</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id}>
                      <td className="border border-gray-800 p-3 text-center print:p-2">{index + 1}.</td>
                      <td className="border border-gray-800 p-3 print:p-2">{product.particulars}</td>
                      <td className="border border-gray-800 p-3 text-center print:p-2">{product.netQty.toString().padStart(2, '0')}</td>
                      <td className="border border-gray-800 p-3 text-right print:p-2">{product.ratePerSheet.toFixed(2)}</td>
                      <td className="border border-gray-800 p-3 text-right print:p-2">{product.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Empty rows for spacing if needed */}
                  {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="border border-gray-800 p-3 print:p-2">&nbsp;</td>
                      <td className="border border-gray-800 p-3 print:p-2">&nbsp;</td>
                      <td className="border border-gray-800 p-3 print:p-2">&nbsp;</td>
                      <td className="border border-gray-800 p-3 print:p-2">&nbsp;</td>
                      <td className="border border-gray-800 p-3 print:p-2">&nbsp;</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-gray-800 p-3 print:p-2" colSpan="4">
                      <div className="text-right font-bold">INVOICE VALUE</div>
                    </td>
                    <td className="border border-gray-800 p-3 text-right font-bold print:p-2">{invoiceValue.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-3 print:p-2" colSpan="3">
                      <div className="text-right">CGST</div>
                    </td>
                    <td className="border border-gray-800 p-3 text-center print:p-2">9%</td>
                    <td className="border border-gray-800 p-3 text-right print:p-2">{cgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-3 print:p-2" colSpan="3">
                      <div className="text-right">SGST</div>
                    </td>
                    <td className="border border-gray-800 p-3 text-center print:p-2">9%</td>
                    <td className="border border-gray-800 p-3 text-right print:p-2">{sgst.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-800 p-3 print:p-2" colSpan="4">
                      <div className="text-right font-bold">TOTAL INVOICE VALUE</div>
                    </td>
                    <td className="border border-gray-800 p-3 text-right font-bold print:p-2">{totalInvoiceValue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total in Words */}
            <div className="mb-8 text-center print:mb-6">
              <p className="font-bold text-gray-800 text-base print:text-sm">
                TOTAL IN WORDS: {numberToWords(Math.floor(totalInvoiceValue))} RUPEES ONLY
              </p>
            </div>

            {/* Signature Area */}
            <div className="flex justify-end mt-12 print:mt-8">
              <div className="text-center">
                {/* <div className="w-28 h-16 border-2 border-gray-800 rounded-full flex items-center justify-center mb-2 print:w-24 print:h-12 print:mb-2">
                  <span className="text-sm font-bold print:text-xs">SIGNATURE</span>
                </div> */}
                &nbsp;
                &nbsp;
                <p className="text-sm font-bold print:text-sm">{companyDetails.name} CONSULTING</p>
                <p className="text-sm print:text-sm">ENGINEERS</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-4 print:hidden">
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Items
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            >
              <FaPrint className="mr-2" /> Print Invoice
            </button>
            <button
              onClick={() => {
                setStep(1);
                setClientDetails({ name: '', address: '', gstin: '', phone: '', email: '' });
                setProducts([]);
                setSelectedFixedProducts({});
                setCurrentProduct({ particulars: '', netQty: 1, ratePerSheet: 0 });
                setShowCustomProductForm(false);
                setBillNumber(`${Math.floor(Math.random() * 100)}/0/25-26`);
                setBillDate(new Date().toISOString().split('T')[0]);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Invoice
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-size: 14px;
            line-height: 1.4;
          }
          
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
            margin: 0;
            padding: 0;
            box-shadow: none;
            border-radius: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          
          .print\\:p-1 {
            padding: 0.25rem !important;
          }
          
          .print\\:m-0 {
            margin: 0 !important;
          }
          
          .print\\:max-w-none {
            max-width: none !important;
          }
          
          .print\\:pb-3 {
            padding-bottom: 0.75rem !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          
          .print\\:mb-5 {
            margin-bottom: 1.25rem !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .print\\:mb-2 {
            margin-bottom: 0.5rem !important;
          }
          
          .print\\:mt-2 {
            margin-top: 0.5rem !important;
          }
          
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
          
          .print\\:gap-6 {
            gap: 1.5rem !important;
          }
          
          .print\\:ml-2 {
            margin-left: 0.5rem !important;
          }
          
          .print\\:space-y-1 > * + * {
            margin-top: 0.25rem !important;
          }
          
          .print\\:w-10 {
            width: 2.5rem !important;
          }
          
          .print\\:h-10 {
            height: 2.5rem !important;
          }
          
          .print\\:w-5 {
            width: 1.25rem !important;
          }
          
          .print\\:h-5 {
            height: 1.25rem !important;
          }
          
          .print\\:w-24 {
            width: 6rem !important;
          }
          
          .print\\:h-12 {
            height: 3rem !important;
          }
          
          .print\\:mr-3 {
            margin-right: 0.75rem !important;
          }
          
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          
          .print\\:text-xl {
            font-size: 1.25rem !important;
          }
          
          .print\\:text-base {
            font-size: 1rem !important;
          }
          
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          
          /* Ensure table fits properly with larger fonts */
          table {
            width: 100% !important;
            font-size: 13px !important;
          }
          
          th, td {
            padding: 6px 8px !important;
            font-size: 13px !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BillGenerator;