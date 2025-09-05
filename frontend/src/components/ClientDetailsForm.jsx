import React from 'react';

export const ClientDetailsForm = ({ 
  clientDetails, 
  handleClientDetailsChange, 
  labourCessRate, 
  setLabourCessRate, 
  onLabourCessChange 
}) => {
  return (
    <section className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Client Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-name">
            Client Name
          </label>
          <input
            id="client-name"
            type="text"
            value={clientDetails.name}
            onChange={(e) => handleClientDetailsChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter client name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-address">
            Address
          </label>
          <input
            id="client-address"
            type="text"
            value={clientDetails.address}
            onChange={(e) => handleClientDetailsChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-phone">
            Phone
          </label>
          <input
            id="client-phone"
            type="tel"
            value={clientDetails.phone}
            onChange={(e) => handleClientDetailsChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="client-email">
            Email
          </label>
          <input
            id="client-email"
            type="email"
            value={clientDetails.email}
            onChange={(e) => handleClientDetailsChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="quotation-date">
            Quotation Date
          </label>
          <input
            id="quotation-date"
            type="date"
            value={clientDetails.quotationDate}
            onChange={(e) => handleClientDetailsChange('quotationDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="labour-cess">
            Labour Cess (%)
          </label>
          <input
            id="labour-cess"
            type="number"
            value={labourCessRate}
            onChange={(e) => {
              const newRate = parseFloat(e.target.value) || 1;
              setLabourCessRate(newRate);
              onLabourCessChange(newRate);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1.0"
            step="0.1"
            min="0"
            max="10"
          />
        </div>
      </div>
    </section>
  );
};