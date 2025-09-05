import React from 'react';
import { FaCalculator, FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

export const QuantityCalculator = ({
  item,
  scheduleIndex,
  itemIndex,
  onCalcRowChange,
  onAddCalcRow,
  onDeleteCalcRow,
  onSaveCalculation,
  onCancel
}) => {
  // Ensure calcRows exists and has at least one row
  const calcRows = item.calcRows || [];
  
  // Calculate total quantity from all rows
  const totalRowQty = calcRows.reduce((sum, row) => {
    const length = parseFloat(row.length) || 0;
    const width = parseFloat(row.width) || 0;
    const height = parseFloat(row.height) || 1;
    return sum + (length * width * height);
  }, 0);

  // Handle input changes with proper number parsing
  const handleInputChange = (rowIndex, field, value) => {
    onCalcRowChange(scheduleIndex, itemIndex, rowIndex, field, value);
  };

  return (
    <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
      <header className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FaCalculator className="text-blue-600" />
          Quantity Calculator
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onAddCalcRow(scheduleIndex, itemIndex)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
            title="Add new calculation row"
          >
            <FaPlus size={12} /> Add Row
          </button>
          <button
            onClick={() => onCancel(scheduleIndex, itemIndex)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            title="Close calculator"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 border text-left text-sm font-medium">Description</th>
              <th className="py-2 px-3 border text-sm font-medium">Length (m)</th>
              <th className="py-2 px-3 border text-sm font-medium">Width (m)</th>
              <th className="py-2 px-3 border text-sm font-medium">Height (m)</th>
              <th className="py-2 px-3 border text-sm font-medium">Qty ({item.unit || 'units'})</th>
              <th className="py-2 px-3 border text-sm font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {calcRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 px-3 border text-center text-gray-500">
                  No calculation rows. Click "Add Row" to start.
                </td>
              </tr>
            ) : (
              calcRows.map((row, rowIndex) => {
                const rowQty = (parseFloat(row.length) || 0) * (parseFloat(row.width) || 0) * (parseFloat(row.height) || 1);
                
                return (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="py-2 px-3 border">
                      <input
                        type="text"
                        value={row.description || ''}
                        onChange={(e) => handleInputChange(rowIndex, 'description', e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter description"
                      />
                    </td>
                    <td className="py-2 px-3 border">
                      <input
                        type="number"
                        value={row.length || ''}
                        onChange={(e) => handleInputChange(rowIndex, 'length', e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="py-2 px-3 border">
                      <input
                        type="number"
                        value={row.width || ''}
                        onChange={(e) => handleInputChange(rowIndex, 'width', e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="py-2 px-3 border">
                      <input
                        type="number"
                        value={row.height || ''}
                        onChange={(e) => handleInputChange(rowIndex, 'height', e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="py-2 px-3 border text-center font-semibold text-blue-600">
                      {rowQty.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 border text-center">
                      <button
                        onClick={() => onDeleteCalcRow(scheduleIndex, itemIndex, rowIndex)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete this row"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {calcRows.length > 0 && (
            <tfoot className="bg-blue-100">
              <tr>
                <td colSpan="4" className="py-3 px-3 border text-right font-semibold text-gray-700">
                  Total Quantity:
                </td>
                <td className="py-3 px-3 border text-center font-bold text-blue-700 text-lg">
                  {totalRowQty.toFixed(3)}
                </td>
                <td className="py-3 px-3 border"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="mt-4 flex gap-3 justify-end">
        <button
          onClick={() => onSaveCalculation(scheduleIndex, itemIndex)}
          disabled={calcRows.length === 0 || totalRowQty === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          title={calcRows.length === 0 ? "Add at least one row to save" : "Save calculation to quantity field"}
        >
          <FaSave size={14} /> Save Calculation ({totalRowQty.toFixed(3)})
        </button>
        <button
          onClick={() => onCancel(scheduleIndex, itemIndex)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      {totalRowQty > 0 && (
        <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-700">
          <strong>Preview:</strong> This will set the quantity to <strong>{totalRowQty.toFixed(3)} {item.unit || 'units'}</strong>
        </div>
      )}
    </section>
  );
};