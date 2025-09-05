import React from 'react';
import { FaPlus } from 'react-icons/fa';

export const AddScheduleForm = ({
  showAddSchedule,
  newScheduleData,
  setNewScheduleData,
  onAddSchedule,
  onCancel
}) => {
  if (!showAddSchedule) return null;

  return (
    <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold mb-3 text-blue-800">Add New Schedule</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="schedule-number">
            Schedule Number/Identifier
          </label>
          <input
            id="schedule-number"
            type="text"
            value={newScheduleData.schedule}
            onChange={(e) => setNewScheduleData(prev => ({
              ...prev,
              schedule: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., B2, I, II, III, RA-1, etc."
          />
          <p className="text-xs text-gray-500 mt-1">Enter unique schedule identifier</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="schedule-description">
            Schedule Description
          </label>
          <input
            id="schedule-description"
            type="text"
            value={newScheduleData.description}
            onChange={(e) => setNewScheduleData(prev => ({
              ...prev,
              description: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Rate Analysis, Foundation Work, etc."
          />
          <p className="text-xs text-gray-500 mt-1">Describe the type of work</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAddSchedule}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition font-medium"
        >
          <FaPlus /> Add Schedule
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Preview */}
      {(newScheduleData.schedule || newScheduleData.description) && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Preview:</p>
          <p className="font-medium">
            Schedule {newScheduleData.schedule} - {newScheduleData.description}
          </p>
        </div>
      )}
    </section>
  );
};