import React, { memo } from 'react';
import { FaChevronDown, FaChevronUp, FaPlus, FaTrash } from 'react-icons/fa';
import { WorkItemForm } from './WorkItemForm';

export const ScheduleSection = memo(({
  schedule,
  scheduleIndex,
  isOpen,
  onToggle,
  onAddItem,
  onRemoveSchedule,
  onItemChange,
  onRemoveItem,
  labourCessRate,
  quantityCalculatorProps
}) => {
  const scheduleTotal = schedule.item_of_works.reduce((sum, item) => sum + (item.amount || 0), 0);
  const scheduleLabourCess = schedule.item_of_works.reduce((sum, item) => 
    sum + ((item.qty || 0) * (item.labourCessOnRate || 0)), 0
  );
  const scheduleBase = schedule.item_of_works.reduce((sum, item) => 
    sum + ((item.qty || 0) * (item.rate || 0)), 0
  );

  const handleToggle = () => onToggle(scheduleIndex);
  const handleAddItem = (e) => {
    e.stopPropagation();
    onAddItem(scheduleIndex);
  };
  const handleRemoveSchedule = (e) => {
    e.stopPropagation();
    onRemoveSchedule(scheduleIndex);
  };

  return (
    <section className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      <header
        className="flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-700 text-white px-6 py-4 cursor-pointer  transition-all duration-200"
        onClick={handleToggle}
      >
        <h2 className="text-sm font-semibold flex items-center gap-3 w-3xl">
          <span className="bg-blue-600 w-35 px-3 py-1 rounded-full text-sm font-medium">
            Schedule {schedule.schedule}
          </span>
          {schedule.description || 'Work Items'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddItem}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors duration-200 text-sm font-medium"
            title="Add new item to this schedule"
          >
            <FaPlus className="text-xs" /> Add Item
          </button>
          <button
            onClick={handleRemoveSchedule}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-colors duration-200 text-sm font-medium"
            title="Remove this schedule"
          >
            <FaTrash className="text-xs" /> Remove
          </button>
          <span className="text-xl transition-transform duration-200">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
      </header>

      {isOpen && (
        <div className="p-6 bg-gray-50">
          <div className="space-y-4">
            {schedule.item_of_works?.length > 0 ? (
              schedule.item_of_works.map((item, itemIndex) => (
                <WorkItemForm
                  key={`${scheduleIndex}-${itemIndex}`}
                  item={item}
                  itemIndex={itemIndex}
                  scheduleIndex={scheduleIndex}
                  labourCessRate={labourCessRate}
                  onChange={onItemChange}
                  onRemove={onRemoveItem}
                  quantityCalculatorProps={quantityCalculatorProps}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No items in this schedule</p>
                <p className="text-sm">Click "Add Item" to add work items</p>
              </div>
            )}
          </div>

          {/* Schedule Summary */}
          <section className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Schedule {schedule.schedule} Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-600 block mb-1">Base Amount (without Labour Cess)</span>
                <span className="text-lg font-semibold text-gray-800">
                  ₹{scheduleBase.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-orange-600 block mb-1">Labour Cess Amount</span>
                <span className="text-lg font-semibold text-orange-800">
                  ₹{scheduleLabourCess.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-green-600 block mb-1">Schedule Total</span>
                <span className="text-xl font-bold text-green-800">
                  ₹{scheduleTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
});