import React from 'react';

export const SummarySection = ({ 
  baseAmountWithoutLabourCess,
  totalLabourCessAmount,
  subtotal,
  gstAmount,
  finalTotal,
  labourCessRate 
}) => {
  return (
    <section className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Project Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Base Project Amount (without Labour Cess):</span>
          <span className="font-semibold text-lg">₹{baseAmountWithoutLabourCess.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Labour Cess ({labourCessRate}%):</span>
          <span className="font-semibold text-lg text-orange-600">₹{totalLabourCessAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Subtotal (Base + Labour Cess):</span>
          <span className="font-semibold text-lg text-blue-600">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">GST (18%) on Subtotal:</span>
          <span className="font-semibold text-lg">₹{gstAmount.toFixed(2)}</span>
        </div>
        <hr className="border-gray-300" />
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-800">Total Project Amount:</span>
          <span className="text-2xl font-bold text-green-600">₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Cost Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-gray-600">Base Work</div>
            <div className="font-bold text-gray-600">₹{baseAmountWithoutLabourCess.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {((baseAmountWithoutLabourCess / finalTotal) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-gray-600">Labour Cess</div>
            <div className="font-bold text-orange-600">₹{totalLabourCessAmount.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {((totalLabourCessAmount / finalTotal) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-gray-600">GST (18%)</div>
            <div className="font-bold text-green-600">₹{gstAmount.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {((gstAmount / finalTotal) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="text-center p-3 bg-green-100 rounded border-2 border-green-300">
            <div className="text-gray-700 font-medium">Total Amount</div>
            <div className="font-bold text-green-700 text-lg">₹{finalTotal.toFixed(2)}</div>
            <div className="text-xs text-green-600">100%</div>
          </div>
        </div>
      </div>
    </section>
  );
};