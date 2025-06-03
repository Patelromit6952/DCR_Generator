import React, { useEffect, useState } from 'react'
import { CiCircleMinus } from "react-icons/ci";4
import api from '../Backend_api/SummaryApi'

export const DisplaySedB = () => {
  const [sedData, setSedData] = useState([])

  const fetchData = async () => {
    try {
      const response = await api.createSedB({})
      if (response?.data?.data) {
        const formatted = response.data.data.map(schedule => ({
          ...schedule,
          item_of_works: schedule.item_of_works?.map(item => ({
            ...item,
            qty: item.qty || 0,
            rate: item.rate || 0,
            amount: (item.qty || 0) * (item.rate || 0)
          }))
        }))
        setSedData(formatted)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (scheduleIndex, itemIndex, field, value) => {
    const updated = [...sedData]
    const item = updated[scheduleIndex].item_of_works[itemIndex]
    item[field] = parseFloat(value) || 0
    item.amount = item.qty * item.rate
    setSedData(updated)
  }
  const handleRemoveRow = (scheduleIndex, itemIndex) => {
  const updated = [...sedData]
  updated[scheduleIndex].item_of_works.splice(itemIndex, 1)
  setSedData(updated)
}


  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold mb-6">Schedule-wise Work Items</h1>

      {sedData.map((scheduleBlock, scheduleIndex) => (
        <div key={scheduleBlock._id} className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Schedule: {scheduleBlock.schedule}
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 border">Item. No</th>
                  <th className="py-2 px-4 border">Item of Work</th>
                  <th className="py-2 px-4 border">Qty</th>
                  <th className="py-2 px-4 border">Rate</th>
                  <th className="py-2 px-4 border">Unit</th>
                  <th className="py-2 px-4 border">Amount</th>
                  <th className="py-2 px-4 border">Delete</th>
                </tr>
              </thead>
              <tbody>
                {scheduleBlock.item_of_works?.map((item, itemIndex) => (
                  <tr key={itemIndex} className="text-center border-b">
                    <td className="py-2 px-4 border">{itemIndex + 1}</td>
                    <td className="py-2 px-4 border">{item.description}</td>

                    <td className="py-2 px-4 border">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={e =>
                          handleChange(scheduleIndex, itemIndex, 'qty', e.target.value)
                        }
                        className="w-20 p-1 border rounded"
                      />
                    </td>

                    <td className="py-2 px-4 border">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={e =>
                          handleChange(scheduleIndex, itemIndex, 'rate', e.target.value)
                        }
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                        
                    <td className="py-2 px-4 border">{item.unit || '-'}</td>
                    <td className="py-2 px-4 border">{item.amount.toFixed(2)}</td>
                    <td className="py-2 px-4 border">
                        <button onClick={() => handleRemoveRow(scheduleIndex, itemIndex)} className="text-red-600 hover:text-red-800 font-semibold">
                        <CiCircleMinus size={25}/>        
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            <tfoot>
            <tr className="bg-gray-100 font-semibold text-right">
                <td colSpan="5" className="py-2 px-4 border text-right">Total</td>
                <td className="py-2 px-4 border text-center">
                {scheduleBlock.item_of_works.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </td>
                <td className="py-2 px-4 border"></td>
            </tr>

            <tr className="bg-gray-100 font-semibold text-right">
                <td colSpan="5" className="py-2 px-4 border text-right">GST (18%)</td>
                <td className="py-2 px-4 border text-center">
                {(scheduleBlock.item_of_works.reduce((sum, item) => sum + item.amount, 0) * 0.18).toFixed(2)}
                </td>
                <td className="py-2 px-4 border"></td>
            </tr>

            <tr className="bg-gray-200 font-bold text-right">
                <td colSpan="5" className="py-2 px-4 border text-right">Grand Total</td>
                <td className="py-2 px-4 border text-center">
                {(scheduleBlock.item_of_works.reduce((sum, item) => sum + item.amount, 0) * 1.18).toFixed(2)}
                </td>
                <td className="py-2 px-4 border"></td>
            </tr>
            </tfoot>

            </table>
          </div> 
        </div>
      ))}
             <div className="mt-12">
  <h2 className="text-xl font-bold mb-4">Summary of All Schedules</h2>
  <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
    <thead className="bg-gray-800 text-white">
      <tr>
        <th className="py-2 px-4 border">Schedule</th>
        <th className="py-2 px-4 border">Description</th>
        <th className="py-2 px-4 border">Grand Total</th>
      </tr>
    </thead>
    <tbody>
      {sedData.map((schedule, index) => {
        const total = schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0);
        const grandTotal = total * 1.18; 
        return (
          <tr key={index} className="text-center border-b">
            <td className="py-2 px-4 border">{schedule.schedule}</td>
            <td className="py-2 px-4 border">{schedule.description || '-'}</td>
            <td className="py-2 px-4 border font-semibold">₹ {grandTotal.toFixed(2)}</td>
          </tr>
          
        );
      })}
     
    </tbody>
     <tfoot>
         <tr className="bg-gray-200 font-bold text-right">
                <td colSpan="2" className="py-2 px-4 border text-right">Grand Total</td>
                <td className="py-2 px-4 border text-center">
                    {
                        sedData.map((schedule,index)=>{
                             const total = schedule.item_of_works.reduce((sum, item) => sum + item.amount, 0);
                        })
                    }
                </td>
                <td className="py-2 px-4 border"></td>
            </tr>
    </tfoot>
    
  </table>
</div>
    </div>
  )
}
