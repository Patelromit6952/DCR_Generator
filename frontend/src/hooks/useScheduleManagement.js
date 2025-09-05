import { useState } from "react";

export const useScheduleManagement = (data, setData, setDropdownOpen) => {
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newScheduleData, setNewScheduleData] = useState({
    schedule: '',
    description: '',
    item_of_works: []
  });

  const addNewSchedule = (showMessage) => {
    if (!newScheduleData.schedule.trim() || !newScheduleData.description.trim()) {
      alert('Please enter both schedule number and description');
      return;
    }

    const scheduleExists = data.some(schedule =>
      schedule.schedule.toLowerCase().trim() === newScheduleData.schedule.toLowerCase().trim()
    );

    if (scheduleExists) {
      alert('Schedule number already exists. Please use a different number.');
      return;
    }

    const newSchedule = {
      schedule: newScheduleData.schedule.trim(),
      description: newScheduleData.description.trim(),
      item_of_works: [
        {
          description: 'New Work Item - Click to edit description',
          qty: 0,
          rate: 0,
          labourCessOnRate: 0,
          finalRate: 0,
          amount: 0,
          unit: 'Sqm',
          calcRows: [],
          showQtyCalc: false
        }
      ]
    };

    const updatedData = [...data, newSchedule];
    setData(updatedData);

    const newIndex = updatedData.length - 1;
    setDropdownOpen(prev => ({
      ...prev,
      [newIndex]: true
    }));

    setNewScheduleData({
      schedule: '',
      description: '',
      item_of_works: []
    });
    setShowAddSchedule(false);
    showMessage('New schedule added successfully!');
  };

  const addNewItemToSchedule = (scheduleIndex) => {
    const updated = [...data];
    updated[scheduleIndex].item_of_works.push({
      description: 'New Work Item',
      qty: 0,
      rate: 0,
      labourCessOnRate: 0,
      finalRate: 0,
      amount: 0,
      unit: 'Sqm',
      calcRows: [],
      showQtyCalc: false
    });
    setData(updated);
  };

  const removeSchedule = (scheduleIndex, dropdownOpen) => {
    if (window.confirm('Are you sure you want to remove this entire schedule?')) {
      const updated = [...data];
      updated.splice(scheduleIndex, 1);
      setData(updated);

      const newDropdownState = {};
      updated.forEach((_, index) => {
        newDropdownState[index] = dropdownOpen[index] || false;
      });
      setDropdownOpen(newDropdownState);
    }
  };

  return {
    showAddSchedule,
    setShowAddSchedule,
    newScheduleData,
    setNewScheduleData,
    addNewSchedule,
    addNewItemToSchedule,
    removeSchedule
  };
};
