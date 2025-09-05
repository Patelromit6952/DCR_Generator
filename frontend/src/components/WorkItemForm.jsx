import React from 'react';
import { FaTrash, FaCalculator } from 'react-icons/fa';
import { QuantityCalculator } from './QuantityCalculator';

export const WorkItemForm = ({
  item,
  itemIndex,
  scheduleIndex,
  labourCessRate,
  onChange,
  onRemove,
  quantityCalculatorProps
}) => {
  const unitOptions = ['Sqm', 'Cum', 'Nos', 'Kg', 'Ton', 'Rmt', 'LS'];

  return (
    <article className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      {/* Item Header */}
      <header className="bg-gray-50 p-4 border-b">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mb-2">
              Item {itemIndex + 1} 
            </span>
            <input type='text' value={item.sorPage} className='p-1 ml-4 w-100' onChange={(e) => onChange(scheduleIndex, itemIndex, 'sorPage', e.target.value)}/>
            <textarea
              value={item.description}
              onChange={(e) => onChange(scheduleIndex, itemIndex, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
              placeholder="Enter work description"
            />
          </div>
          <button
            onClick={() => onRemove(scheduleIndex, itemIndex)}
            className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
          >
            <FaTrash />
          </button>
        </div>
      </header>

      {/* Item Details */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity ({item.unit})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={item.qty}
                onChange={(e) => onChange(scheduleIndex, itemIndex, 'qty', e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <button
                onClick={() => quantityCalculatorProps.onToggle(scheduleIndex, itemIndex)}
                className="bg-blue-600 flex-shrink-0 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition"
              >
                <FaCalculator />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              value={item.unit}
              onChange={(e) => onChange(scheduleIndex, itemIndex, 'unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Rate (₹/{item.unit})
            </label>
            <input
              type="number"
              value={item.rate}
              onChange={(e) => onChange(scheduleIndex, itemIndex, 'rate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labour Cess ({labourCessRate}%)
            </label>
            <input
              type="text"
              value={`₹${(item.labourCessOnRate || 0).toFixed(2)}`}
              readOnly
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 font-semibold text-orange-700"
            />
            <p className="text-xs text-gray-500 mt-1">Per {item.unit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Rate (₹/{item.unit})
            </label>
            <input
              type="text"
              value={`₹${(item.finalRate || 0).toFixed(2)}`}
              readOnly
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-blue-50 font-semibold text-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount (₹)
            </label>
            <input
              type="text"
              value={`₹${(item.amount || 0).toFixed(2)}`}
              readOnly
              className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 font-bold text-green-700"
            />
          </div>
        </div>

        {/* Quantity Calculator */}
        {quantityCalculatorProps.isCalculatorOpen(scheduleIndex, itemIndex) && (
          <QuantityCalculator
            item={item}
            scheduleIndex={scheduleIndex}
            itemIndex={itemIndex}
            {...quantityCalculatorProps}
          />
        )}
      </div>
    </article>
  );
};