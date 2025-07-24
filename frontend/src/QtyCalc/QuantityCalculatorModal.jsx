import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuantityCalculatorModel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scheduleIndex, itemIndex, item, scheduleData } = location.state || {};

  const [rows, setRows] = useState([{ length: '', width: '', height: '' }]);

  const addRow = () => {
    setRows([...rows, { length: '', width: '', height: '' }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const calculateQty = () => {
    let totalQty = 0;
    rows.forEach((row) => {
      const l = parseFloat(row.length) || 0;
      const w = parseFloat(row.width) || 0;
      const h = parseFloat(row.height) || 1; // height optional
      totalQty += l * w * h;
    });

    // update original data and go back
    const updatedData = [...scheduleData];
    updatedData[scheduleIndex].item_of_works[itemIndex].qty = totalQty;
    updatedData[scheduleIndex].item_of_works[itemIndex].amount =
      totalQty * updatedData[scheduleIndex].item_of_works[itemIndex].rate;

    navigate(-1, { state: { updatedData } });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Quantity Calculation</h1>

      <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-2 px-4 border">Length</th>
            <th className="py-2 px-4 border">Width</th>
            <th className="py-2 px-4 border">Height</th>
            <th className="py-2 px-4 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="text-center border-b">
              <td className="py-2 px-4 border">
                <input
                  type="number"
                  value={row.length}
                  onChange={(e) => handleInputChange(index, 'length', e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td className="py-2 px-4 border">
                <input
                  type="number"
                  value={row.width}
                  onChange={(e) => handleInputChange(index, 'width', e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td className="py-2 px-4 border">
                <input
                  type="number"
                  value={row.height}
                  onChange={(e) => handleInputChange(index, 'height', e.target.value)}
                  className="w-full p-1 border rounded"
                />
              </td>
              <td className="py-2 px-4 border">
                <button
                  onClick={() => removeRow(index)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  ✖
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={addRow}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          ➕ Add Row
        </button>

        <button
          onClick={calculateQty}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          ✅ Calculate & Save
        </button>
      </div>
    </div>
  );
};

export default QuantityCalculatorModel;