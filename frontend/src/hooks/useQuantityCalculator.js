import { useState, useCallback } from 'react';

export const useQuantityCalculator = (setData) => {
  const [qtyCalcOpen, setQtyCalcOpen] = useState({});

  const toggleQtyCalc = useCallback((scheduleIndex, itemIndex) => {
    const key = `${scheduleIndex}-${itemIndex}`;
    setQtyCalcOpen(prev => {
      const newState = {
        ...prev,
        [key]: !prev[key]
      };
      console.log(`Toggling calculator for ${key}:`, newState[key]); // Debug log
      return newState;
    });
  }, []);

  const cancelQtyCalc = useCallback((scheduleIndex, itemIndex) => {
    const key = `${scheduleIndex}-${itemIndex}`;
    setQtyCalcOpen(prev => ({
      ...prev,
      [key]: false
    }));
  }, []);

  const isCalculatorOpen = useCallback((scheduleIndex, itemIndex) => {
    const key = `${scheduleIndex}-${itemIndex}`;
    return qtyCalcOpen[key] || false;
  }, [qtyCalcOpen]);

  const handleCalcRowChange = useCallback((scheduleIndex, itemIndex, rowIndex, field, value) => {
    console.log(`handleCalcRowChange called: schedule ${scheduleIndex}, item ${itemIndex}, row ${rowIndex}, field ${field}, value ${value}`);
    setData(prevData => {
      const updated = [...prevData];
      const schedule = updated[scheduleIndex];
      const item = schedule.item_of_works[itemIndex];
      
      console.log('Current item:', item);
      console.log('Current calcRows:', item.calcRows);
      
      // Ensure calcRows exists
      if (!item.calcRows) {
        item.calcRows = [];
        console.log('Initialized calcRows as empty array in handleCalcRowChange');
      }
      
      // Ensure the row exists
      if (!item.calcRows[rowIndex]) {
        item.calcRows[rowIndex] = {
          description: '',
          length: 0,
          width: 0,
          height: 1
        };
        console.log(`Created new row at index ${rowIndex}`);
      }
      
      // Create a new item with updated calcRows
      const updatedCalcRows = [...(item.calcRows || [])];
      updatedCalcRows[rowIndex] = {
        ...updatedCalcRows[rowIndex],
        [field]: field === 'description' ? value : parseFloat(value) || 0
      };
      
      const updatedItem = {
        ...item,
        calcRows: updatedCalcRows
      };
      
      // Update the schedule with the new item
      const updatedSchedule = {
        ...schedule,
        item_of_works: schedule.item_of_works.map((itm, idx) => 
          idx === itemIndex ? updatedItem : itm
        )
      };
      
      // Update the data with the new schedule
      updated[scheduleIndex] = updatedSchedule;
      
      console.log(`Updated row ${rowIndex}, field ${field} to ${updatedCalcRows[rowIndex][field]}`);
      console.log('Updated calcRows:', updatedCalcRows);
      console.log('Updated data:', updated);
      
      return updated;
    });
  }, [setData]);

  const addCalcRow = useCallback((scheduleIndex, itemIndex) => {
    console.log(`addCalcRow called for schedule ${scheduleIndex}, item ${itemIndex}`);
    setData(prevData => {
      const updated = [...prevData];
      const schedule = updated[scheduleIndex];
      const item = schedule.item_of_works[itemIndex];
      
      console.log('Current item:', item);
      console.log('Current calcRows:', item.calcRows);
      
      // Create a new item with updated calcRows
      const updatedItem = {
        ...item,
        calcRows: [...(item.calcRows || []), {
          description: '',
          length: 0,
          width: 0,
          height: 1
        }]
      };
      
      // Update the schedule with the new item
      const updatedSchedule = {
        ...schedule,
        item_of_works: schedule.item_of_works.map((itm, idx) => 
          idx === itemIndex ? updatedItem : itm
        )
      };
      
      // Update the data with the new schedule
      updated[scheduleIndex] = updatedSchedule;
      
      console.log('Updated item:', updatedItem);
      console.log('Updated calcRows:', updatedItem.calcRows);
      console.log('Updated data:', updated);
      
      return updated;
    });
  }, [setData]);

  const deleteCalcRow = useCallback((scheduleIndex, itemIndex, rowIndex) => {
    setData(prevData => {
      const updated = [...prevData];
      const schedule = updated[scheduleIndex];
      const item = schedule.item_of_works[itemIndex];
      
      if (item.calcRows && item.calcRows.length > rowIndex) {
        // Create a new item with updated calcRows
        const updatedItem = {
          ...item,
          calcRows: item.calcRows.filter((_, idx) => idx !== rowIndex)
        };
        
        // Update the schedule with the new item
        const updatedSchedule = {
          ...schedule,
          item_of_works: schedule.item_of_works.map((itm, idx) => 
            idx === itemIndex ? updatedItem : itm
          )
        };
        
        // Update the data with the new schedule
        updated[scheduleIndex] = updatedSchedule;
      }
      
      return updated;
    });
  }, [setData]);

  const saveCalculation = useCallback((scheduleIndex, itemIndex, labourCessRate = 0) => {
    setData(prevData => {
      const updated = [...prevData];
      const schedule = updated[scheduleIndex];
      const item = schedule.item_of_works[itemIndex];
      
      // Calculate total quantity from all calc rows
      const totalQty = item.calcRows ? item.calcRows.reduce((sum, row) => {
        const length = parseFloat(row.length) || 0;
        const width = parseFloat(row.width) || 0;
        const height = parseFloat(row.height) || 1;
        return sum + (length * width * height);
      }, 0) : 0;
      
      // Create a new item with updated values
      const rate = parseFloat(item.rate) || 0;
      const labourCessOnRate = (rate * labourCessRate) / 100;
      const finalRate = rate + labourCessOnRate;
      const amount = totalQty * finalRate;
      
      const updatedItem = {
        ...item,
        qty: parseFloat(totalQty.toFixed(3)), // Round to 3 decimal places
        labourCessOnRate: parseFloat(labourCessOnRate.toFixed(2)),
        finalRate: parseFloat(finalRate.toFixed(2)),
        amount: parseFloat(amount.toFixed(2))
      };
      
      // Update the schedule with the new item
      const updatedSchedule = {
        ...schedule,
        item_of_works: schedule.item_of_works.map((itm, idx) => 
          idx === itemIndex ? updatedItem : itm
        )
      };
      
      // Update the data with the new schedule
      updated[scheduleIndex] = updatedSchedule;
      
      return updated;
    });

    // Close the calculator
    const key = `${scheduleIndex}-${itemIndex}`;
    setQtyCalcOpen(prev => ({
      ...prev,
      [key]: false
    }));
  }, [setData]);

  return {
    qtyCalcOpen,
    toggleQtyCalc,
    cancelQtyCalc,
    isCalculatorOpen,
    handleCalcRowChange,
    addCalcRow,
    deleteCalcRow,
    saveCalculation
  };
};